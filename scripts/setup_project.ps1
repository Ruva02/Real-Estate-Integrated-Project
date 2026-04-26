# setup_project.ps1
# This script automates the local Docker development environment setup.

Write-Host "--- Haven AI Local Setup ---" -ForegroundColor Cyan

# 1. Check for Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker was not found. Installing via Winget..." -ForegroundColor Yellow
    winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
    Write-Host "Please start Docker Desktop and RESTART this script." -ForegroundColor White
    exit
}

# 2. Build and Start Containers
Write-Host "`nBuilding and starting Docker environment..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "`n--- Setup Complete ---" -ForegroundColor Green
Write-Host "Backend API reachable at: http://localhost:5016" -ForegroundColor White
Write-Host "Frontend App reachable at: http://localhost:3000" -ForegroundColor White
