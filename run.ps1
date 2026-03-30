#!/usr/bin/env pwsh

<#
.DESCRIPTION
    AudiogramPro Offline - One-Click Setup & Run Script
    This script installs dependencies, starts the dev server, and opens the browser
.EXAMPLE
    .\run.ps1
#>

param()

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "`n   🎉 AudiogramPro Offline - One-Click Setup & Run`n" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "`n"

# Check if in correct directory
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this from the project root." -ForegroundColor Red
    Write-Host "📍 Expected location: d:\setup\laragon\www\LAB\" -ForegroundColor Red
    Read-Host "`nPress Enter to exit"
    exit 1
}

# Step 1: Check dependencies
Write-Host "✅ Step 1: Checking dependencies...`n" -ForegroundColor Yellow

if (-not (Test-Path "$projectRoot\node_modules\next")) {
    Write-Host "📦 Installing dependencies... This may take a few minutes.`n" -ForegroundColor Cyan
    
    & npm install --omit=optional
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n⚠️  npm install had some issues, but continuing anyway...`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Dependencies already installed!`n" -ForegroundColor Green
}

# Step 2: Start dev server
Write-Host "`n✅ Step 2: Starting development server...`n" -ForegroundColor Yellow

Write-Host "🌐 Opening browser in 3 seconds...`n" -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:9002"

Write-Host "`n" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "`n   🎉 Development server starting on http://localhost:9002`n" -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server`n" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "`n"

# Start dev server
& npm run dev
