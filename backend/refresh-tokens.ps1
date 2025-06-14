# HRMS Token Refresh Script
# This script refreshes authentication tokens and updates test-tokens.json

param([string]$ServerPort = "5009")

$baseUrl = "http://localhost:$ServerPort"
$tokensFile = "test-tokens.json"

Write-Host "Refreshing HRMS Authentication Tokens..." -ForegroundColor Cyan
Write-Host "Server: $baseUrl" -ForegroundColor Gray
Write-Host ""

function Get-AuthToken {
    param(
        [string]$Email,
        [string]$Password,
        [string]$RoleName
    )
    
    Write-Host "Getting $RoleName token..." -ForegroundColor Yellow
    
    try {
        $loginData = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json
        
        $response = curl.exe -s -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" -d $loginData
        $jsonResponse = $response | ConvertFrom-Json
        
        if ($jsonResponse.success -eq $true) {
            Write-Host "SUCCESS: $RoleName token obtained" -ForegroundColor Green
            return $jsonResponse.data
        } else {
            Write-Host "FAILED: $RoleName login" -ForegroundColor Red
            Write-Host "Error: $($jsonResponse.error.message)" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "ERROR: $RoleName login" -ForegroundColor Red
        Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get tokens for all roles
$adminData = Get-AuthToken -Email "admin@hrms.com" -Password "Admin123!" -RoleName "Admin"
$managerData = Get-AuthToken -Email "manager@hrms.com" -Password "Manager123!" -RoleName "Manager"
$employeeData = Get-AuthToken -Email "employee@hrms.com" -Password "Employee123!" -RoleName "Employee"

if ($adminData -and $managerData -and $employeeData) {
    # Create tokens object
    $tokens = @{
        admin = @{
            email = "admin@hrms.com"
            password = "Admin123!"
            token = $adminData.accessToken
            userId = $adminData.user.id
            role = $adminData.user.role
            employeeId = $adminData.employee.id
        }
        manager = @{
            email = "manager@hrms.com"
            password = "Manager123!"
            token = $managerData.accessToken
            userId = $managerData.user.id
            role = $managerData.user.role
            employeeId = $managerData.employee.id
        }
        employee = @{
            email = "employee@hrms.com"
            password = "Employee123!"
            token = $employeeData.accessToken
            userId = $employeeData.user.id
            role = $employeeData.user.role
            employeeId = $employeeData.employee.id
        }
        _notes = @{
            description = "Authentication tokens for API testing"
            server_port = $ServerPort
            last_updated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
            usage = "Use these tokens in Authorization header: 'Bearer <token>'"
            endpoints = @{
                admin_dashboard = "GET /api/dashboard/admin"
                manager_dashboard = "GET /api/dashboard/manager"
                employee_dashboard = "GET /api/dashboard/employee"
            }
        }
    }
    
    # Save to file
    $tokens | ConvertTo-Json -Depth 4 | Out-File -FilePath $tokensFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "SUCCESS: All tokens refreshed and saved to $tokensFile" -ForegroundColor Green
    Write-Host "You can now run: .\test-dashboard-apis.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "FAILED: Could not refresh all tokens" -ForegroundColor Red
}
