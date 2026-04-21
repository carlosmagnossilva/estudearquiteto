try {
    $response = Invoke-WebRequest -Uri 'https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/' -UseBasicParsing -TimeoutSec 30
    $status = $response.StatusCode
    $content = $response.Content.Length
    Write-Host "Status: $status"
    Write-Host "Content length: $content"
} catch {
    Write-Host "Error: $_"
}