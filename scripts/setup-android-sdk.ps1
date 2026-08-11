# Instala Android SDK mínimo para Cordova Android 9 (API 29) y configura env del usuario.
# Uso: npm run android:sdk-setup
#      powershell -ExecutionPolicy Bypass -File scripts/setup-android-sdk.ps1

$ErrorActionPreference = 'Stop'
$SdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$CmdToolsZip = Join-Path $env:TEMP 'commandlinetools-win.zip'
$CmdToolsUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'

# cmdline-tools recientes requieren Java 17+
$javaHome = $null
foreach ($c in @(
  'C:\Program Files\Java\jdk-21',
  'C:\Program Files\Eclipse Adoptium\jdk-17.0.9+9',
  $env:JAVA_HOME
)) {
  if ($c -and (Test-Path "$c\bin\java.exe")) { $javaHome = $c; break }
}
if (-not $javaHome) {
  $detected = (java -XshowSettings:properties -version 2>&1 | Select-String 'java.home')
  if ($detected) { $javaHome = $detected.ToString().Split('=', 2)[1].Trim() }
}
if (-not $javaHome) { throw 'Se necesita JDK 17+ (ideal JDK 21) para sdkmanager.' }

$env:JAVA_HOME = $javaHome
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:ANDROID_HOME = $SdkRoot

Write-Host "==> JAVA_HOME: $javaHome"
Write-Host "==> SDK root: $SdkRoot"
New-Item -ItemType Directory -Force -Path $SdkRoot | Out-Null

$sdkmanager = Get-ChildItem -Path $SdkRoot -Recurse -Filter 'sdkmanager.bat' -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $sdkmanager) {
  Write-Host '==> Descargando Android cmdline-tools...'
  Invoke-WebRequest -Uri $CmdToolsUrl -OutFile $CmdToolsZip
  $extract = Join-Path $env:TEMP 'android-cmdline-tools'
  if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
  Expand-Archive -Path $CmdToolsZip -DestinationPath $extract -Force
  $dest = Join-Path $SdkRoot 'cmdline-tools\latest'
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  $inner = Get-ChildItem $extract | Select-Object -First 1
  Move-Item $inner.FullName $dest
  $sdkmanager = Join-Path $dest 'bin\sdkmanager.bat'
}

if (-not (Test-Path $sdkmanager)) {
  throw "No se encontro sdkmanager en $SdkRoot"
}

Write-Host "==> sdkmanager: $sdkmanager"
Write-Host '==> Aceptando licencias...'
$yes = ("y`n" * 60)
$yes | & $sdkmanager --sdk_root="$SdkRoot" --licenses | Out-Host

Write-Host '==> Instalando platform-tools, android-29, build-tools 29.0.3...'
& $sdkmanager --sdk_root="$SdkRoot" 'platform-tools' 'platforms;android-29' 'build-tools;29.0.3'

Write-Host '==> Variables de usuario...'
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $SdkRoot, 'User')
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $SdkRoot, 'User')
[Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
foreach ($p in @(
  (Join-Path $SdkRoot 'platform-tools'),
  (Join-Path $SdkRoot 'cmdline-tools\latest\bin')
)) {
  if ($userPath -notlike "*$p*") {
    $userPath = if ([string]::IsNullOrWhiteSpace($userPath)) { $p } else { "$userPath;$p" }
  }
}
[Environment]::SetEnvironmentVariable('Path', $userPath, 'User')

Write-Host ''
Write-Host "OK. SDK en $SdkRoot"
Write-Host 'Cierra y reabre la terminal, luego: npm run android:build'
