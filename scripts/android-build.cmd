@echo off
REM Entorno para Cordova Android 9 (JDK 8 + SDK + Gradle)
setlocal EnableDelayedExpansion
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-8.0.502.7-hotspot"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
set "GRADLE_HOME=%LOCALAPPDATA%\gradle\gradle-6.5.1"
set "PATH=%JAVA_HOME%\bin;%ANDROID_SDK_ROOT%\platform-tools;%GRADLE_HOME%\bin;%PATH%"

set "ROOT=%~dp0.."
set "OUT_APK=%ROOT%\abimar.apk"
set "DEBUG_NAMED=%ROOT%\platforms\android\app\build\outputs\apk\debug\abimar.apk"
set "DEBUG_APK=%ROOT%\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
set "RELEASE_NAMED=%ROOT%\platforms\android\app\build\outputs\apk\release\abimar.apk"
set "RELEASE_APK=%ROOT%\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk"

node "%~dp0fix-android-repos.js"
if exist "%ROOT%\resources\icon.png" (
  node "%~dp0generate-app-icons.js"
)
if exist "%ROOT%\resources\splash.png" (
  node "%~dp0generate-splash.js"
)

if not exist "%ROOT%\platforms\android\app\build-extras.gradle" (
  copy /Y "%~dp0build-extras-android.gradle" "%ROOT%\platforms\android\app\build-extras.gradle" >nul
)

call npm run build:app
if errorlevel 1 exit /b %errorlevel%

REM Gradle UP-TO-DATE puede reutilizar un APK viejo aunque www haya cambiado.
echo Eliminando APKs previos para forzar empaquetado...
del /q "%ROOT%\platforms\android\app\build\outputs\apk\debug\*.apk" 2>nul
if /i "%~1"=="--release" del /q "%ROOT%\platforms\android\app\build\outputs\apk\release\*.apk" 2>nul
if exist "%OUT_APK%" del /q "%OUT_APK%"

npx cordova build android %*
if errorlevel 1 exit /b %errorlevel%

set "BUILT_APK="
if exist "%DEBUG_NAMED%" (
  set "BUILT_APK=%DEBUG_NAMED%"
) else if exist "%DEBUG_APK%" (
  set "BUILT_APK=%DEBUG_APK%"
) else if exist "%RELEASE_NAMED%" (
  set "BUILT_APK=%RELEASE_NAMED%"
) else if exist "%RELEASE_APK%" (
  set "BUILT_APK=%RELEASE_APK%"
)

if not defined BUILT_APK (
  echo No se encontro el APK generado.
  exit /b 1
)

copy /Y "!BUILT_APK!" "%OUT_APK%"
if errorlevel 1 (
  echo ERROR: no se pudo copiar el APK a la raiz del repo.
  echo Instala desde: !BUILT_APK!
  exit /b 1
)

for %%A in ("!BUILT_APK!") do set "SRCSIZE=%%~zA"
for %%A in ("%OUT_APK%") do set "DSTSIZE=%%~zA"
if not "!SRCSIZE!"=="!DSTSIZE!" (
  echo ERROR: abimar.apk de la raiz no coincide con el APK recien compilado.
  echo Origen: !BUILT_APK!
  exit /b 1
)

echo.
echo APK listo (usar este archivo, no uno anterior):
echo   !BUILT_APK!
echo Copia en raiz:
dir "%OUT_APK%"
endlocal
