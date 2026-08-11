@echo off
REM Entorno para Cordova Android 9 (JDK 8 + SDK + Gradle)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-8.0.502.7-hotspot"
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
set "ANDROID_HOME=%ANDROID_SDK_ROOT%"
set "GRADLE_HOME=%LOCALAPPDATA%\gradle\gradle-6.5.1"
set "PATH=%JAVA_HOME%\bin;%ANDROID_SDK_ROOT%\platform-tools;%GRADLE_HOME%\bin;%PATH%"

node "%~dp0fix-android-repos.js"
if exist "%~dp0..\resources\icon.png" (
  node "%~dp0generate-app-icons.js"
)
if exist "%~dp0..\resources\splash.png" (
  node "%~dp0generate-splash.js"
)

REM Asegura nombre de salida abimar.apk
if not exist "%~dp0..\platforms\android\app\build-extras.gradle" (
  copy /Y "%~dp0build-extras-android.gradle" "%~dp0..\platforms\android\app\build-extras.gradle" >nul
)

call npm run build:app
if errorlevel 1 exit /b %errorlevel%
npx cordova build android %*
if errorlevel 1 exit /b %errorlevel%

set "OUT_APK=%~dp0..\abimar.apk"
set "DEBUG_NAMED=%~dp0..\platforms\android\app\build\outputs\apk\debug\abimar.apk"
set "DEBUG_APK=%~dp0..\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
set "RELEASE_NAMED=%~dp0..\platforms\android\app\build\outputs\apk\release\abimar.apk"
set "RELEASE_APK=%~dp0..\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk"

if exist "%DEBUG_NAMED%" (
  copy /Y "%DEBUG_NAMED%" "%OUT_APK%" >nul
) else if exist "%DEBUG_APK%" (
  copy /Y "%DEBUG_APK%" "%OUT_APK%" >nul
) else if exist "%RELEASE_NAMED%" (
  copy /Y "%RELEASE_NAMED%" "%OUT_APK%" >nul
) else if exist "%RELEASE_APK%" (
  copy /Y "%RELEASE_APK%" "%OUT_APK%" >nul
) else (
  echo No se encontro el APK generado.
  exit /b 1
)

echo.
echo APK listo: abimar.apk
dir "%OUT_APK%"
