<#
.SYNOPSIS
    Script en PowerShell para enviar datos de prueba a Unimonpark vía API REST.
    Permite autenticarse como Administrador y simular la creación de usuarios,
    externos y vehículos.
#>

param (
    [string]$BaseUrl = "http://localhost:8080/api",
    [string]$Username = "admin",
    [string]$Password = "Admin1234*"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "INICIANDO CARGA DE FLUJO COMPLETO EN UNIMONPARK (API REST)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Autenticación
Write-Host "`n[1/4] Autenticando con el backend..." -ForegroundColor Yellow
$loginBody = @{
    nombreUsuario = $Username
    contrasena = $Password
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $authResponse.token
    Write-Host "✓ Autenticado exitosamente. Token obtenido." -ForegroundColor Green
} catch {
    Write-Host "✗ Error de autenticación: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegúrate de que el backend esté arriba y las credenciales sean correctas." -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 2. Registrar Visitante Externo
Write-Host "`n[2/4] Registrando Visitante Externo..." -ForegroundColor Yellow
$externo = @{
    tipoDocumento   = "CC"
    numeroDocumento = "12195866"
    nombres         = "LUIS"
    apellidos       = "BERNAL"
    telefono        = "3100000001"
    correo          = "luis.bernal@externos.com"
    empresa         = "Visitante Independiente"
    activo          = $true
} | ConvertTo-Json

try {
    $resExt = Invoke-RestMethod -Uri "$BaseUrl/externos" -Method Post -Body $externo -Headers $headers
    $idExterno = $resExt.idExterno
    Write-Host "✓ Externo registrado: LUIS BERNAL (ID: $idExterno)" -ForegroundColor Green
} catch {
    Write-Host "! Nota: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 3. Registrar Vehículo de Externo
Write-Host "`n[3/4] Registrando Vehículo del Externo..." -ForegroundColor Yellow
$vehiculoExt = @{
    tipoPropietario  = "EXTERNO"
    idExterno        = $idExterno
    idUsuario        = $null
    idTipoVehiculo   = 3 # Bicicleta
    placa            = "2"
    marca            = "GW"
    modelo           = "Hyena"
    color            = "Negro"
    categoriaPersona = "EXTERNO"
    activo           = $true
} | ConvertTo-Json

try {
    $resVeh = Invoke-RestMethod -Uri "$BaseUrl/vehiculos" -Method Post -Body $vehiculoExt -Headers $headers
    Write-Host "✓ Vehículo de externo registrado (Placa/Ficha: 2, ID: $($resVeh.idVehiculo))" -ForegroundColor Green
} catch {
    Write-Host "! Nota: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "Para cargar los 44 registros de una sola vez en la base de datos," -ForegroundColor White
Write-Host "ejecuta el script SQL generado en:" -ForegroundColor White
Write-Host "docs/sql/cargar_datos_flujo_completo.sql" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
