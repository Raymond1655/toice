param([string]$Encoder = 'ffmpeg')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$rootDir = Split-Path -Parent $PSScriptRoot
$audioDir = Join-Path $rootDir 'public/audio/exams'
$temporaryDir = Join-Path $rootDir '.qa/audio-build'
New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
New-Item -ItemType Directory -Force -Path $temporaryDir | Out-Null
$entries = Get-Content -LiteralPath (Join-Path $rootDir 'content/exam-audio.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Zira Desktop')
$speaker.Rate = -1
$hashFile = Join-Path $rootDir 'content/exam-audio-hashes.json'
$hashes = @{}
if (Test-Path -LiteralPath $hashFile) {
  $savedHashes = Get-Content -LiteralPath $hashFile -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($property in $savedHashes.PSObject.Properties) { $hashes[$property.Name] = $property.Value }
}
$sha = [System.Security.Cryptography.SHA256]::Create()
$generated = 0
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
try {
  foreach ($entry in $entries) {
    if ($entry.id -notmatch '^[a-zA-Z0-9-]+$') { throw 'Invalid audio identifier' }
    $compressed = $entry.id.StartsWith('v2-')
    $extension = if ($compressed) { '.mp3' } else { '.wav' }
    $targetFile = Join-Path $audioDir ($entry.id + $extension)
    $encodingVersion = if ($compressed) { 'Zira:-1:16000:mp3-40k:' } else { 'Zira:-1:16000:' }
    $fingerprint = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($encodingVersion + $entry.text))).Replace('-', '').ToLowerInvariant()
    if ((Test-Path -LiteralPath $targetFile) -and (($hashes[$entry.id] -eq $fingerprint) -or (-not $entry.id.StartsWith('v2-') -and -not $hashes.ContainsKey($entry.id)))) {
      $hashes[$entry.id] = $fingerprint
      continue
    }
    $waveFile = if ($compressed) { Join-Path $temporaryDir ($entry.id + '.wav') } else { $targetFile }
    if ($compressed -and -not (Get-Command $Encoder -ErrorAction SilentlyContinue)) { throw 'Provide a trusted FFmpeg executable with -Encoder to encode new MP3 files.' }
    $speaker.SetOutputToWaveFile($waveFile, $format)
    $speaker.Speak($entry.text)
    $speaker.SetOutputToNull()
    if ($compressed) {
      & $Encoder -hide_banner -loglevel error -y -i $waveFile -codec:a libmp3lame -b:a 40k -ar 16000 -ac 1 $targetFile
      if ($LASTEXITCODE -ne 0) { throw ('Audio encoding failed: ' + $entry.id) }
      Remove-Item -LiteralPath $waveFile
    }
    $hashes[$entry.id] = $fingerprint
    $generated++
    if ($generated % 25 -eq 0) { Write-Output ('Generated ' + $generated + ' new audio files') }
  }
} finally { $speaker.Dispose(); $sha.Dispose() }
$hashes | ConvertTo-Json | Set-Content -LiteralPath $hashFile -Encoding UTF8
Write-Output ('Audio entries: ' + $entries.Count + '; rebuilt: ' + $generated)
