/**
 * Genera densidades de icono Android/iOS desde resources/icon.png (logo Abimar).
 * Uso: node scripts/generate-app-icons.js
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const srcIcon = path.join(root, 'resources', 'icon.png');

const androidIcons = [
  ['drawable-ldpi-icon.png', 36],
  ['drawable-mdpi-icon.png', 48],
  ['drawable-hdpi-icon.png', 72],
  ['drawable-xhdpi-icon.png', 96],
  ['drawable-xxhdpi-icon.png', 144],
  ['drawable-xxxhdpi-icon.png', 192]
];

const mipmapCopy = [
  ['mipmap-ldpi', 36],
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192]
];

if (!fs.existsSync(srcIcon)) {
  console.error('Falta resources/icon.png');
  process.exit(1);
}

function resizeWithPowerShell(input, output, size) {
  const ps = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${input.replace(/'/g, "''")}')
$bmp = New-Object System.Drawing.Bitmap(${size}, ${size})
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, ${size}, ${size})
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
    throw new Error('resize failed: ' + output);
  }
}

const outAndroid = path.join(root, 'resources', 'android', 'icon');
fs.mkdirSync(outAndroid, { recursive: true });

// Master 1024
const master = path.join(root, 'resources', 'icon-1024.png');
resizeWithPowerShell(srcIcon, master, 1024);
fs.copyFileSync(master, srcIcon);

for (const [name, size] of androidIcons) {
  const out = path.join(outAndroid, name);
  resizeWithPowerShell(srcIcon, out, size);
  console.log('android', name, size);
}

const platformRes = path.join(root, 'platforms', 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(platformRes)) {
  for (const [folder, size] of mipmapCopy) {
    const dir = path.join(platformRes, folder);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'ic_launcher.png');
    resizeWithPowerShell(srcIcon, out, size);
    // Cordova también usa ic_launcher_foreground / round en algunos casos
    const round = path.join(dir, 'ic_launcher_round.png');
    fs.copyFileSync(out, round);
    const fg = path.join(dir, 'ic_launcher_foreground.png');
    if (fs.existsSync(path.join(dir + '-v26')) || true) {
      // foreground usado por adaptive; copiar también
      fs.copyFileSync(out, fg);
    }
    console.log('platform', folder);
  }
}

// Favicon app
const faviconDir = path.join(root, 'src', 'assets', 'icon');
fs.mkdirSync(faviconDir, { recursive: true });
resizeWithPowerShell(srcIcon, path.join(faviconDir, 'favicon.png'), 192);
resizeWithPowerShell(srcIcon, path.join(faviconDir, 'abimar-icon.png'), 512);

console.log('OK iconos Abimar generados');
