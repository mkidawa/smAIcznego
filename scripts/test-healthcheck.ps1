# Default values
$host_url = "http://localhost:3000"
$endpoint = "/api/healthcheck"
$url = "${host_url}${endpoint}"

Write-Host "Testing healthcheck endpoint at ${url}"

try {
    # Make the request
    $response = Invoke-WebRequest -Uri $url -Method GET
    $body = $response.Content | ConvertFrom-Json
    $statusCode = $response.StatusCode

    # Check if the request was successful
    if ($statusCode -eq 200 -and $body.status -eq "healthy") {
        Write-Host "`u{2713} Healthcheck passed" -ForegroundColor Green
        Write-Host "Status: $($body.status)"
        Write-Host "Message: $($body.message)"
        exit 0
    } else {
        Write-Host "`u{2717} Healthcheck failed" -ForegroundColor Red
        Write-Host "Status Code: $statusCode"
        Write-Host "Status: $($body.status)"
        Write-Host "Message: $($body.message)"
        exit 1
    }
} catch {
    Write-Host "`u{2717} Healthcheck failed" -ForegroundColor Red
    Write-Host "Error: $_"
    exit 1
} 