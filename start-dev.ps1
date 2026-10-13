# start-dev.ps1 - Convenience script to start both Backend and Frontend locally
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Starting SecurePasswordManagerSystem Dev Servers" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Spring Boot backend in a dedicated window
Write-Host "[1/2] Launching Spring Boot Backend on http://localhost:8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; .\mvnw.cmd spring-boot:run"

# 2. Wait 3 seconds then start Frontend dev server
Start-Sleep -Seconds 3
Write-Host "[2/2] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location "$projectRoot\Frontend"
npm run dev
