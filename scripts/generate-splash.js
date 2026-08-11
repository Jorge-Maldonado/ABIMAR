/**
 * Genera splash Abimar Shop (densidades Android Cordova) desde resources/splash.png.
 * Fondo #0B0B0D; contain centrado para no recortar logo/texto.
 * Uso: node scripts/generate-splash.js
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const srcSplash = path.join(root, 'resources', 'splash.png');
const bg = '0B0B0D';

const androidSplash = [
  ['drawable-land-ldpi-screen.png', 320, 200],
  ['drawable-land-mdpi-screen.png', 480, 320],
  ['drawable-land-hdpi-screen.png', 800, 480],
  ['drawable-land-xhdpi-screen.png', 1280, 720],
  ['drawable-land-xxhdpi-screen.png', 1600, 960],
  ['drawable-land-xxxhdpi-screen.png', 1920, 1280],
  ['drawable-port-ldpi-screen.png', 200, 320],
  ['drawable-port-mdpi-screen.png', 320, 480],
  ['drawable-port-hdpi-screen.png', 480, 800],
  ['drawable-port-xhdpi-screen.png', 720, 1280],
  ['drawable-port-xxhdpi-screen.png', 960, 1600],
  ['drawable-port-xxxhdpi-screen.png', 1280, 1920]
];

const platformFolders = [
  ['drawable-land-ldpi', 320, 200],
  ['drawable-land-mdpi', 480, 320],
  ['drawable-land-hdpi', 800, 480],
  ['drawable-land-xhdpi', 1280, 720],
  ['drawable-land-xxhdpi', 1600, 960],
  ['drawable-land-xxxhdpi', 1920, 1280],
  ['drawable-port-ldpi', 200, 320],
  ['drawable-port-mdpi', 320, 480],
  ['drawable-port-hdpi', 480, 800],
  ['drawable-port-xhdpi', 720, 1280],
  ['drawable-port-xxhdpi', 960, 1600],
  ['drawable-port-xxxhdpi', 1280, 1920]
];

if (!fs.existsSync(srcSplash)) {
  console.error('Falta resources/splash.png');
  process.exit(1);
}

function fitSplash(input, output, width, height) {
  const ps = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${input.replace(/'/g, "''")}')
$bmp = New-Object System.Drawing.Bitmap(${width}, ${height})
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#${bg}'))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$scale = [Math]::Min(${width} / $src.Width, ${height} / $src.Height)
$dw = [int]([Math]::Round($src.Width * $scale))
$dh = [int]([Math]::Round($src.Height * $scale))
$dx = [int]((${width} - $dw) / 2)
$dy = [int]((${height} - $dh) / 2)
$g.DrawImage($src, $dx, $dy, $dw, $dh)
$g.Dispose()
$dir = Split-Path '${output.replace(/'/g, "''")}'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$bmp.Save('${output.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$src.Dispose()
`;
  const r = spawnSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error('splash resize failed: ' + output);
  }
}

const outAndroid = path.join(root, 'resources', 'android', 'splash');
fs.mkdirSync(outAndroid, { recursive: true });

for (const [name, w, h] of androidSplash) {
  const out = path.join(outAndroid, name);
  fitSplash(srcSplash, out, w, h);
  console.log('android', name, w + 'x' + h);
}

const platformRes = path.join(root, 'platforms', 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(platformRes)) {
  for (const [folder, w, h] of platformFolders) {
    const dir = path.join(platformRes, folder);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'screen.png');
    fitSplash(srcSplash, out, w, h);
    console.log('platform', folder);
  }
  // Fallback genérico Cordova
  const drawable = path.join(platformRes, 'drawable');
  fs.mkdirSync(drawable, { recursive: true });
  fitSplash(srcSplash, path.join(drawable, 'screen.png'), 960, 1600);
  console.log('platform drawable/screen.png');
}

console.log('OK splash Abimar generados');
