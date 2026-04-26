# install_dependencies.ps1
# This script automates the installation of Terraform and AWS CLI on Windows using Winget.

Write-Host "--- Haven AI Infrastructure Dependency Installer ---" -ForegroundColor Cyan

# 1. Check for Winget
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Error "Winget not found. Please install App Installer from the Microsoft Store."
    exit
}

# 2. Install Terraform
Write-Host "`n[1/2] Installing Terraform via Winget..." -ForegroundColor Yellow
winget install Hashicorp.Terraform --accept-package-agreements --accept-source-agreements

# 3. Install AWS CLI
Write-Host "`n[2/2] Installing AWS CLI via Winget..." -ForegroundColor Yellow
winget install Amazon.AWSCLI --accept-package-agreements --accept-source-agreements

Write-Host "`n--- Installation Complete ---" -ForegroundColor Green
Write-Host "Please RESTART your terminal/PowerShell for the 'terraform' and 'aws' commands to become available." -ForegroundColor White
Write-Host "After restart, run 'aws configure' to set up your credentials." -ForegroundColor White
