$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$rootDir = Split-Path -Parent $PSScriptRoot
$audioDir = Join-Path $rootDir 'public/audio/exams'
New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
$entries = Get-Content -LiteralPath (Join-Path $rootDir 'content/exam-audio.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice('Microsoft Zira Desktop')
$speaker.Rate = -1
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
try {
  foreach ($entry in $entries) {
    $targetFile = Join-Path $audioDir ($entry.id + '.wav')
    $speaker.SetOutputToWaveFile($targetFile, $format)
    $speaker.Speak($entry.text)
    $speaker.SetOutputToNull()
  }
} finally { $speaker.Dispose() }
Write-Output ('Audio files: ' + (Get-ChildItem -LiteralPath $audioDir -Filter '*.wav').Count)
