@echo off
REM Compila el APK debug y lo instala en el dispositivo USB.
REM Siempre instala el APK de platforms/.../debug, no un abimar.apk viejo de la raiz.
setlocal
cd /d "%~dp0.."

set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB%" (
  echo No se encontro adb en:
  echo   %ADB%
  exit /b 1
)

echo Dispositivos:
"%ADB%" devices
"%ADB%" get-state 2>nul | findstr /i /x "device" >nul
if errorlevel 1 (
  echo.
  echo No hay un dispositivo en estado "device".
  echo Activa Depuracion USB y acepta el dialogo en el telefono.
  exit /b 1
)

call "%~dp0android-build.cmd"
if errorlevel 1 exit /b %errorlevel%

set "APK=%cd%\platforms\android\app\build\outputs\apk\debug\abimar.apk"
if not exist "%APK%" set "APK=%cd%\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo No se encontro el APK debug recien compilado.
  exit /b 1
)

echo.
echo Instalando:
echo   %APK%
"%ADB%" install -r "%APK%"
if errorlevel 1 exit /b %errorlevel%

echo.
echo Listo. Cierra Abimar Shop por completo en el telefono y vuelve a abrirla.
endlocal
