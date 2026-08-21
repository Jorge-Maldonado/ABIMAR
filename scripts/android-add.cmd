@echo off
REM Agrega o actualiza la plataforma Android con www ya compilado
REM (incluye src/assets: productos, categorias, index.json).
setlocal
cd /d "%~dp0.."

echo Sincronizando catalogo de imagenes...
node "%~dp0sync-product-assets.js"
if errorlevel 1 exit /b %errorlevel%

echo Generando www con assets locales (base-href ./)...
call npm run build:app
if errorlevel 1 exit /b %errorlevel%

if exist "platforms\android" (
  echo Plataforma android ya existe. Copiando www a la plataforma...
  npx cordova prepare android
) else (
  echo Agregando plataforma android...
  npx cordova platform add android
)
if errorlevel 1 exit /b %errorlevel%

node "%~dp0fix-android-repos.js"
if errorlevel 1 exit /b %errorlevel%

echo.
echo Assets listos en platforms\android\app\src\main\assets\www\assets
endlocal
