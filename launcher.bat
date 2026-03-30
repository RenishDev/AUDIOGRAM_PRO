@echo off
REM AudiogramPro Offline - One-Click Desktop Launcher
REM Double-click this file to start the application
REM Expected time to browser: 20 seconds

setlocal enabledelayedexpansion

cls
color 0A

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Remove trailing backslash
if "%SCRIPT_DIR:~-1%"=="\" set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

REM Check if running from correct location
if not exist "%SCRIPT_DIR%\package.json" (
    color 0C
    cls
    echo.
    echo ERROR: This script must be in the project root directory!
    echo.
    echo Expected location: E:\xampp\htdocs\LAB\launcher.bat
    echo Current location: %SCRIPT_DIR%
    echo.
    pause
    exit /b 1
)

REM Change to project directory
cd /d "%SCRIPT_DIR%"

REM Display header
cls
color 0A
echo.
echo ======================================================================
echo.
echo   ^^!^! AudiogramPro Offline - Fast Launcher
echo.
echo   Starting in: %SCRIPT_DIR%
echo.
echo ======================================================================
echo.

REM Verify dependencies
if not exist "node_modules" (
    color 0C
    echo ERROR: Dependencies not installed!
    echo.
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\next" (
    color 0C
    echo ERROR: Next.js not found!
    echo.
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM Start browser
timeout /t 1 /nobreak >nul
start http://localhost:9002

REM Show startup message
color 0B
echo.
echo [✓] Opening browser at http://localhost:9002
echo [✓] Starting development server...
echo.
echo       Wait 10-15 seconds for app to load
echo.
echo ======================================================================
echo.

REM Start the dev server
call npm run dev

REM Server stopped
color 0E
echo.
echo Development server stopped.
echo.
pause
