# Crops an image to 16:9 around a focus point and saves it as a 1280x720 JPG.
# FocusX/FocusY: 0..1, where the crop centres (0.5 = middle).
param([string]$In, [string]$Out, [double]$FocusX = 0.5, [double]$FocusY = 0.5)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($In)
$w = $img.Width; $h = $img.Height
if ($w / $h -gt 16 / 9) { $ch = $h; $cw = $h * 16 / 9 } else { $cw = $w; $ch = $w * 9 / 16 }
$x = [math]::Min([math]::Max($w * $FocusX - $cw / 2, 0), $w - $cw)
$y = [math]::Min([math]::Max($h * $FocusY - $ch / 2, 0), $h - $ch)
$bmp = New-Object System.Drawing.Bitmap 1280, 720
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, 1280, 720), (New-Object System.Drawing.Rectangle ([int]$x), ([int]$y), ([int]$cw), ([int]$ch)), 'Pixel')
$img.Dispose()
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92L
$bmp.Save($Out, $codec, $p)
"$Out ($([int]$cw)x$([int]$ch) from ${w}x$h)"
