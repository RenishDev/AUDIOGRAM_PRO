@echo off
REM AudiogramPro Offline - Desktop Shortcut Launcher
REM Create a convenient desktop shortcut to start the application

setlocal enabledelayedexpansion

echo.
echo Creating AudiogramPro Desktop Shortcut...
echo.

REM Get the project root directory (where this script is located)
set "PROJECT_ROOT=%~dp0"

REM Create VBScript to generate shortcut
set "VBS_FILE=%TEMP%\create_shortcut.vbs"

(
    echo Set objShell = CreateObject("WScript.Shell"^)
    echo Set objDesktop = objShell.SpecialFolders("Desktop"^)
    echo Set objLink = objShell.CreateShortcut(objDesktop ^& "\AudiogramPro.lnk"^)
    echo objLink.TargetPath = "%PROJECT_ROOT%SETUP_AND_RUN.bat"
    echo objLink.WorkingDirectory = "%PROJECT_ROOT%"
    echo objLink.Description = "AudiogramPro Offline - Click to Start"
    echo objLink.IconLocation = "%SystemRoot%\System32\imageres.dll,84"
    echo objLink.WindowStyle = 1
    echo objLink.Save
    echo WScript.Echo "Shortcut created successfully!"
) > "%VBS_FILE%"

REM Run the VBScript
cscript.exe "%VBS_FILE%"

REM Clean up
del "%VBS_FILE%" 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ✅ Desktop shortcut created!
    echo.
    echo You can now double-click "AudiogramPro" on your desktop to start.
    echo.
) else (
    echo.
    echo ⚠️  Could not create desktop shortcut automatically.
    echo.
    echo You can create a manual shortcut:
    echo 1. Right-click SETUP_AND_RUN.bat
    echo 2. Select "Create shortcut"
    echo 3. Move it to Desktop
    echo.
)

pause
