@echo off
REM AudiogramPro Offline - INSTANT START
REM Ultra-fast startup with proper Node.js environment setup

cls
color 0A
echo.
echo ======================================================================
echo.
echo   ^^!^! AudiogramPro Offline - INSTANT START ^^!^^!
echo.
echo   Mode: Turbopack enabled (fastest compilation)
echo   Port: 9002
echo   URL: http://localhost:9002
echo.
echo ======================================================================
echo.

REM Navigate to project directory
cd /d "E:\xampp\htdocs\LAB"
if errorlevel 1 (
    color 0C
    echo ERROR: Could not navigate to E:\xampp\htdocs\LAB
    pause
    exit /b 1
)

REM Check if node_modules exists, if not install
if not exist "node_modules" (
    color 0E
    echo [*] Installing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        color 0C
        echo ERROR: npm install failed
        echo Make sure Node.js is installed
        pause
        exit /b 1
    )
)

echo [1/2] Opening browser...
REM Open browser immediately
start http://localhost:9002
echo [✓] Browser opened at http://localhost:9002
echo.

echo [2/2] Starting development server...
echo.
echo ======================================================================
echo   Development Server Starting...
echo   URL: http://localhost:9002
echo.
echo   Press Ctrl+C to stop the server
echo ======================================================================
echo.

REM Use npx to ensure we use local next from node_modules
call npx next dev --turbopack -p 9002

REM If we get here, server was stopped
color 0E
echo.
echo ======================================================================
echo   Development server stopped
echo ======================================================================
echo.
pause
