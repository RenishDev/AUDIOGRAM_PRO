@echo off
REM ============================================================================
REM AudiogramPro Offline - ONE CLICK INSTANT SETUP & START
REM ============================================================================
REM This file does EVERYTHING: installs dependencies, clears cache, starts server
REM Just double-click this file from your desktop!
REM ============================================================================

setlocal enabledelayedexpansion
cls
color 0A

echo.
echo ============================================================================
echo.
echo   ^^!^^ AudiogramPro - ONE CLICK INSTANT START ^^!^^
echo.
echo   This will:
echo   1. Install all dependencies
echo   2. Clear old build cache
echo   3. Start the development server
echo   4. Open your browser automatically
echo.
echo   Port: 9002 ^(http://localhost:9002^)
echo.
echo ============================================================================
echo.

REM Set project directory
set PROJECT_DIR=E:\xampp\htdocs\LAB

REM Check if project directory exists
if not exist "%PROJECT_DIR%" (
    color 0C
    echo ERROR: Project directory not found!
    echo Expected: %PROJECT_DIR%
    echo.
    echo Please update the PROJECT_DIR variable in this file.
    pause
    exit /b 1
)

REM Navigate to project directory
cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    color 0C
    echo ERROR: Could not navigate to project directory
    pause
    exit /b 1
)

echo [STEP 1] Checking Node.js installation...
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js !NODE_VERSION! found
echo.

echo [STEP 2] Installing/updating dependencies...
if not exist "node_modules" (
    echo [*] node_modules not found - running full install...
) else (
    echo [*] node_modules exists - updating...
)

call npm install --legacy-peer-deps
if errorlevel 1 (
    color 0C
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo [✓] Dependencies installed successfully
echo.

echo [STEP 3] Clearing build cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo [✓] Old build cache cleared
) else (
    echo [✓] No old cache to clear
)
echo.

echo [STEP 4] Opening browser...
start http://localhost:9002
echo [✓] Browser will open at http://localhost:9002
echo.

echo [STEP 5] Starting development server...
echo.
echo ============================================================================
echo   Development Server Starting...
echo   URL: http://localhost:9002
echo.
echo   Press Ctrl+C in this window to stop the server
echo.
echo   Wait for the message: "✓ Ready in XXXms"
echo   Then check your browser!
echo ============================================================================
echo.

REM Start the development server
call npx next dev --turbopack -p 9002

REM If we get here, server was stopped
echo.
echo ============================================================================
echo   Server stopped
echo ============================================================================
echo.
pause
endlocal
