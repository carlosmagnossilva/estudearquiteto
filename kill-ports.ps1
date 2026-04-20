# kill-ports.ps1 - Stop all services on common ports

$ports = @(4000, 5001, 3000, 8080, 3001)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        Write-Host "Stopping process $processId on port $port"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Done!"