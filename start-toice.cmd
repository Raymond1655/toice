@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
where pnpm >nul 2>nul
if not errorlevel 1 (
  set "TOICE_PNPM=pnpm"
) else (
  set "TOICE_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
)
if not exist "node_modules\next\package.json" (
  echo Dependencies missing. Run pnpm install --frozen-lockfile first.
  pause
  exit /b 1
)
echo TOICE - open http://127.0.0.1:3000 after Ready appears.
echo Keep this window open. Press Ctrl+C to stop.
call "%TOICE_PNPM%" dev
pause
