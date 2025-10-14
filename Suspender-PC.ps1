# Script: Suspender-PC.ps1
# Suspende el equipo y controla qué dispositivos lo pueden reactivar.

Write-Host "🔄 Configurando dispositivos de reactivación..."

# Primero muestra los dispositivos que pueden reactivar
$wakeDevices = powercfg -devicequery wake_armed
Write-Host "Actualmente estos dispositivos pueden reactivar el equipo:" -ForegroundColor Yellow
$wakeDevices

# Deshabilitar despertar desde la tarjeta de red y mouse (opcional)
# ❗ Si quieres mantenerlos, comenta estas líneas agregando un #
powercfg -devicedisablewake "Mouse compatible con HID"
powercfg -devicedisablewake "Intel(R) Ethernet Connection"
powercfg -devicedisablewake "Intel(R) Wi-Fi"

# Forzar que el teclado sí pueda despertar
# Ajusta el nombre de tu teclado si es distinto
powercfg -deviceenablewake "Teclado estándar PS/2"

Write-Host "✅ Solo el teclado y el botón de encendido pueden despertar el equipo."
Start-Sleep -Seconds 2

# Suspender el equipo
Write-Host "💤 Suspendiendo equipo..."
rundll32.exe powrprof.dll,SetSuspendState 0,1,0
