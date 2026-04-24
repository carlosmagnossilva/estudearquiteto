Write-Host "Obtendo IP público atual..." -ForegroundColor Cyan
$ip = (Invoke-RestMethod -Uri 'https://api.ipify.org')
$ruleName = "Allow_IP_$(Get-Date -Format 'yyyyMMdd_HHmm')"

Write-Host "Autorizando IP $ip no Azure SQL (sqlhub04171601)..." -ForegroundColor Yellow

az sql server firewall-rule create `
    --resource-group rg-hubdeobras-dev `
    --server sqlhub04171601 `
    --name $ruleName `
    --start-ip-address $ip `
    --end-ip-address $ip

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sucesso! IP $ip autorizado com a regra $ruleName." -ForegroundColor Green
} else {
    Write-Host "Erro ao autorizar IP. Verifique se você está logado no Azure (az login)." -ForegroundColor Red
}
