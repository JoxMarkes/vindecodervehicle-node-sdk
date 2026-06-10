# Publish @vindecodervehicle/sdk manually from your machine
# Prerequisites:
# 1. npm login
# 2. Your npm user must be Owner of the vindecodervehicle org

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Checking npm login..." -ForegroundColor Cyan
$whoami = npm whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run: npm login" -ForegroundColor Red
    exit 1
}
Write-Host "Logged in as: $whoami" -ForegroundColor Green

npm run build
npm publish --access public

Write-Host "Published: https://www.npmjs.com/package/@vindecodervehicle/sdk" -ForegroundColor Green