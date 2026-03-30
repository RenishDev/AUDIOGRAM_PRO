@echo off
REM AudiogramPro Offline - Installer & Launcher
REM This script installs dependencies and runs the application

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          AudiogramPro Offline - Installer & Launcher          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if npm is installed
echo.
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: npm is not installed!
    echo.
    pause
    exit /b 1
)

echo ✅ npm found: 
npm --version

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo.
echo ═══════════════════════════════════════════════════════════════
echo Installing Dependencies...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Install dependencies with --omit=optional to skip optional packages
npm install --omit=optional

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Failed to install dependencies!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo ❌ ERROR: node_modules directory was not created!
    echo.
    pause
    exit /b 1
)

echo ═══════════════════════════════════════════════════════════════
echo Starting Development Server...
echo ═══════════════════════════════════════════════════════════════
echo.

echo 🚀 AudiogramPro is starting...
echo.
echo The application will be available at:
echo   📍 http://localhost:9002
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Failed to start the server!
    echo.
    pause
    exit /b 1
)

pause
