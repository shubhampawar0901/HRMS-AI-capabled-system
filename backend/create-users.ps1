# PowerShell script to create test users via API
# Run this script to create the required test users

Write-Host "🚀 Creating HRMS test users..." -ForegroundColor Green

# Check if server is running
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5003/api/auth/register" -Method GET -ErrorAction Stop
} catch {
    Write-Host "❌ Backend server is not running on port 5003" -ForegroundColor Red
    Write-Host "Please start the backend server first with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# User data
$users = @(
    @{
        email = "admin@hrms.com"
        password = "Admin123!"
        role = "admin"
    },
    @{
        email = "manager@hrms.com"
        password = "Manager123!"
        role = "manager"
    },
    @{
        email = "employee@hrms.com"
        password = "Employee123!"
        role = "employee"
    }
)

Write-Host "👥 Creating users..." -ForegroundColor Blue

foreach ($user in $users) {
    try {
        $body = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:5003/api/auth/register" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ Created $($user.role): $($user.email)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($response.message): $($user.email)" -ForegroundColor Yellow
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -like "*409*" -or $errorMessage -like "*already exists*") {
            Write-Host "ℹ️  User already exists: $($user.email)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Error creating $($user.email): $errorMessage" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎉 User creation completed!" -ForegroundColor Green
Write-Host "`n📋 Test Credentials:" -ForegroundColor Blue
Write-Host "ADMIN: admin@hrms.com / Admin123!" -ForegroundColor White
Write-Host "MANAGER: manager@hrms.com / Manager123!" -ForegroundColor White
Write-Host "EMPLOYEE: employee@hrms.com / Employee123!" -ForegroundColor White
Write-Host "`nYou can now test login at: http://localhost:3000" -ForegroundColor Yellow
