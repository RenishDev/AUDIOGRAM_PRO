# AudiogramPro Offline - ULTRA FAST Start (PowerShell)
# Use this if dependencies are already installed!
# Expected startup time: 15-30 seconds to browser open!

param(
    [switch]$SkipBrowser
)

# Clear screen
Clear-Host

# Display header
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   !! AudiogramPro Offline - ULTRA FAST START !!" -ForegroundColor Green
Write-Host ""
Write-Host "   Mode: Turbopack enabled (fastest compilation)" -ForegroundColor Yellow
Write-Host "   Port: 9002" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:9002" -ForegroundColor Yellow
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$ProjectPath = "E:\xampp\htdocs\LAB"
if (-not (Test-Path $ProjectPath)) {
    Write-Host "ERROR: Could not find project at $ProjectPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Set-Location -Path $ProjectPath
Write-Host "Project directory: $((Get-Location).Path)" -ForegroundColor Gray
Write-Host ""

# Verify package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules folder not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Dependencies are NOT installed. Please run:" -ForegroundColor Yellow
    Write-Host "   npm install" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the full setup: run.bat" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify Next.js is installed
if (-not (Test-Path "node_modules\next")) {
    Write-Host "ERROR: Next.js not found in node_modules!" -ForegroundColor Red
    Write-Host "Please run: npm install" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/3] Dependencies verified" -ForegroundColor Green
Write-Host ""

# Open browser (unless -SkipBrowser flag is used)
if (-not $SkipBrowser) {
    Write-Host "[2/3] Opening browser in 1 second..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:9002"
    Write-Host "[✓] Browser opened at http://localhost:9002" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[3/3] Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   Development Server Starting..." -ForegroundColor Green
Write-Host "   URL: http://localhost:9002" -ForegroundColor Yellow
Write-Host "   Engine: Turbopack (FAST MODE)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Run npm dev with Turbopack
npm run dev

# If we get here, server was stopped
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "   Development server stopped" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
