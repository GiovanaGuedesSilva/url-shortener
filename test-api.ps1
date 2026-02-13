# API Test Script for URL Shortener
Write-Host "`n=== URL SHORTENER API TESTS ===" -ForegroundColor Cyan
Write-Host "Testing http://localhost:3000`n" -ForegroundColor Yellow

$baseUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Health: $($health.status)" -ForegroundColor Green
    Write-Host "  Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create Short URL
Write-Host "`n2. Creating Short URL..." -ForegroundColor Green
try {
    $body = @{
        url = "https://www.github.com/GiovanaGuedesSilva/url-shortener"
    } | ConvertTo-Json
    
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/shorten" -Method POST -Body $body -ContentType "application/json"
    $shortCode = $createResponse.shortCode
    Write-Host "✓ Short URL created!" -ForegroundColor Green
    Write-Host "  Short Code: $shortCode" -ForegroundColor Yellow
    Write-Host "  Response: $($createResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Get URL Info
Write-Host "`n3. Getting URL Info..." -ForegroundColor Green
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/shorten/$shortCode" -Method GET
    Write-Host "✓ URL Info retrieved!" -ForegroundColor Green
    Write-Host "  Response: $($getResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update URL
Write-Host "`n4. Updating URL..." -ForegroundColor Green
try {
    $updateBody = @{
        url = "https://www.github.com/GiovanaGuedesSilva/url-shortener-updated"
    } | ConvertTo-Json
    
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/shorten/$shortCode" -Method PUT -Body $updateBody -ContentType "application/json"
    Write-Host "✓ URL updated!" -ForegroundColor Green
    Write-Host "  Response: $($updateResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Update failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Statistics
Write-Host "`n5. Getting Statistics..." -ForegroundColor Green
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/shorten/$shortCode/stats" -Method GET
    Write-Host "✓ Statistics retrieved!" -ForegroundColor Green
    Write-Host "  Access Count: $($statsResponse.accessCount)" -ForegroundColor Yellow
    Write-Host "  Response: $($statsResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Stats failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Redirect
Write-Host "`n6. Testing Redirect..." -ForegroundColor Green
try {
    $redirectResponse = Invoke-WebRequest -Uri "$baseUrl/$shortCode" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($redirectResponse.StatusCode -eq 301) {
        Write-Host "✓ Redirect working! (301)" -ForegroundColor Green
        Write-Host "  Location: $($redirectResponse.Headers.Location)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 301) {
        Write-Host "✓ Redirect working! (301)" -ForegroundColor Green
        Write-Host "  Location: $($_.Exception.Response.Headers.Location)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Redirect failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Delete URL
Write-Host "`n7. Deleting URL..." -ForegroundColor Green
try {
    Invoke-RestMethod -Uri "$baseUrl/shorten/$shortCode" -Method DELETE
    Write-Host "✓ URL deleted successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Delete failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Verify deletion (should return 404)
Write-Host "`n8. Verifying deletion (expecting 404)..." -ForegroundColor Green
try {
    Invoke-RestMethod -Uri "$baseUrl/shorten/$shortCode" -Method GET
    Write-Host "✗ URL still exists (should be deleted)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ URL properly deleted (404)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Cyan
Write-Host "Server is running at http://localhost:3000" -ForegroundColor Yellow
Write-Host "Open browser: http://localhost:3000/health`n" -ForegroundColor Yellow
