param (
    [string]$pptxPath,
    [string]$outputPath
)

try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Open($pptxPath, 1, 0, 0)
    $out = ""
    foreach ($slide in $pres.Slides) {
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame -eq -1) {
                $out += $shape.TextFrame.TextRange.Text + "`n"
            }
        }
    }
    $out | Out-File -FilePath $outputPath -Encoding utf8
    $pres.Close()
    $ppt.Quit()
    Write-Output "Extracao concluida: $outputPath"
} catch {
    Write-Error "Erro na extracao: $_"
    if ($ppt) { $ppt.Quit() }
}
