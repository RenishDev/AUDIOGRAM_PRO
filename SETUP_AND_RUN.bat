@echo off
REM AudiogramPro Offline - Easy Launcher
REM This batch file runs the PowerShell installer script

echo.
echo Creating launcher in safe mode...

REM Get the directory where this batch file is located
cd /d "%~dp0"

REM Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: PowerShell is not available!
    echo.
    echo Please ensure Windows PowerShell or PowerShell Core is installed.
    echo.
    pause
    exit /b 1
)

REM Run the PowerShell installer script with proper execution policy
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RUN_AUDIOGRAM.ps1"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation or startup failed!
    echo.
    pause
    exit /b 1
)

exit /b 0
