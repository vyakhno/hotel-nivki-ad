# Builds a labelled contact sheet JPG from the images in a folder.
param([string]$Dir, [string]$Out, [string]$Filter = '*', [int]$Cols = 6, [int]$W = 300, [int]$H = 200)
Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem $Dir -File | Where-Object { $_.Extension -match '\.(jpe?g|png)$' -and $_.Name -like $Filter } | Sort-Object Name
$rows = [math]::Ceiling($files.Count / $Cols)
$sheet = New-Object System.Drawing.Bitmap ($Cols * $W), ($rows * ($H + 18))
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::FromArgb(30, 30, 30))
$g.InterpolationMode = 'HighQualityBicubic'
$font = New-Object System.Drawing.Font 'Segoe UI', 9
$i = 0
foreach ($f in $files) {
  $x = ($i % $Cols) * $W; $y = [math]::Floor($i / $Cols) * ($H + 18)
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $s = [math]::Max($W / $img.Width, $H / $img.Height)
    $sw = $W / $s; $sh = $H / $s
    $src = New-Object System.Drawing.RectangleF (($img.Width - $sw) / 2), (($img.Height - $sh) / 2), $sw, $sh
    $g.DrawImage($img, (New-Object System.Drawing.RectangleF $x, $y, $W, $H), $src, 'Pixel')
    $label = "$($f.Name)  $($img.Width)x$($img.Height)"
    $img.Dispose()
  } catch { $label = "$($f.Name)  (unreadable)" }
  $g.DrawString($label, $font, [System.Drawing.Brushes]::White, $x + 2, $y + $H + 1)
  $i++
}
$sheet.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
"$($files.Count) images -> $Out"
