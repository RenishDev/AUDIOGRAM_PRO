@echo off
REM AudiogramPro Offline - One-Click Setup & Run Script
REM This script installs dependencies, starts the dev server, and opens the browser

cls
echo.
echo ======================================================================
echo.
echo   ^^!^! AudiogramPro Offline - One-Click Setup ^& Run
echo.
echo ======================================================================
echo.

REM Navigate to project directory FIRST
echo Navigating to project folder...
cd /d "d:\setup\laragon\www\LAB"
if errorlevel 1 (
    echo Error: Could not navigate to d:\setup\laragon\www\LAB
    echo Please make sure the path exists.
    pause
    exit /b 1
)

REM Check if in correct directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this from the project root.
    echo Expected location: d:\setup\laragon\www\LAB\
    pause
    exit /b 1
)

echo Step 1: Checking dependencies...
if not exist "node_modules\next" (
    echo.
    echo WARNING: Dependencies not found!
    echo You need to install dependencies first.
    echo.
    echo Running: npm install --omit=optional
    echo This may take 2-5 minutes on first run...
    echo.
    call npm install --omit=optional
    if errorlevel 1 (
        echo.
        echo Error: npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies already installed! Skipping npm install...
)

echo.
echo Step 2: Starting development server...
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak

REM Open browser
start http://localhost:9002

REM Start dev server
echo.
echo ======================================================================
echo.
echo   ^^!^! Development server starting on http://localhost:9002
echo.
echo ======================================================================
echo.

npm run dev

pause
