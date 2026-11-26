$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot

$services = @(
  @{ Name = 'Eureka';       Path = 'Libreria-MS-Eureka';   Command = '.\mvnw.cmd spring-boot:run';                                   Port = 8761 },
  @{ Name = 'Auth';         Path = 'Libreria-MS-Auth';     Command = '.\mvnw.cmd clean spring-boot:run';                          Port = 8084; EurekaName = 'AUTH-SERVICE' },
  @{ Name = 'Libros / Stock'; Path = 'Libreria-MS-Libros'; Command = '.\mvnw.cmd spring-boot:run';                                 Port = 8083; EurekaName = 'STOCK-SERVICE' },
  @{ Name = 'Compras';      Path = 'Libreria-MS-Compras';  Command = "`$env:PURCHASES_SERVER_PORT='8081'; .\mvnw.cmd spring-boot:run"; Port = 8081; EurekaName = 'PURCHASES-SERVICE' },
  @{ Name = 'Ventas';       Path = 'Libreria-MS-Rentas';   Command = '.\mvnw.cmd spring-boot:run';                                   Port = 8082; EurekaName = 'SALES-SERVICE' },
  @{ Name = 'API Gateway';  Path = 'Libreria-MS-Gateway';  Command = '.\mvnw.cmd spring-boot:run';                                   Port = 8080 },
  @{ Name = 'Frontend';     Path = 'Libreria-UI';          Command = 'pnpm dev';                                                  Port = 3000 }
)

function Test-Port([int]$Port) {
  return [bool](Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port })
}

function Wait-Port([int]$Port, [int]$TimeoutSeconds) {
  for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
    if (Test-Port $Port) { return $true }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Wait-Registered([string]$EurekaName, [int]$TimeoutSeconds) {
  for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8761/eureka/apps/$EurekaName" -Headers @{ Accept = 'application/json' } -TimeoutSec 5
      if ($response.StatusCode -eq 200) { return $true }
    } catch {
      # Todavia no registrado: se reintenta.
    }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Start-DevService($service) {
  $workingDirectory = Join-Path $root $service.Path
  if (-not (Test-Path $workingDirectory)) {
    throw "No se encontro la carpeta de $($service.Name): $workingDirectory"
  }

  if (Test-Port $service.Port) {
    Write-Host "[$($service.Name)] Ya esta escuchando en $($service.Port); no se inicia de nuevo." -ForegroundColor Yellow
    return
  }

  Write-Host "[$($service.Name)] Iniciando..." -ForegroundColor Cyan
  $title = "BigoBooks - $($service.Name)"
  $escapedDirectory = $workingDirectory.Replace("'", "''")
  Start-Process powershell.exe -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    "`$Host.UI.RawUI.WindowTitle = '$title'; Set-Location '$escapedDirectory'; $($service.Command)"
  ) | Out-Null
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  throw 'Java no esta disponible en PATH. Instala Java 21 y vuelve a intentar.'
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw 'pnpm no esta disponible en PATH. Instala pnpm y vuelve a intentar.'
}

Write-Host 'BigoBooks DEV: se abrira una ventana por servicio.' -ForegroundColor Green
Write-Host 'Asegurate de tener PostgreSQL y Redis disponibles.' -ForegroundColor Yellow

$eureka = $services[0]
Start-DevService $eureka
if (-not (Wait-Port $eureka.Port 120)) {
  throw 'Eureka no levanto en 8761 tras 120 s. Revisa su ventana.'
}
Write-Host 'Eureka arriba.' -ForegroundColor Green

$backends = $services | Where-Object { $_.EurekaName }
foreach ($service in $backends) {
  Start-DevService $service
}

foreach ($service in $backends) {
  Write-Host "Esperando registro de $($service.EurekaName) en Eureka..." -ForegroundColor DarkGray
  if (-not (Wait-Registered $service.EurekaName 300)) {
    throw "$($service.EurekaName) no se registro en Eureka tras 300 s. Revisa su ventana antes de iniciar el gateway."
  }
  Write-Host "[$($service.Name)] registrado en Eureka." -ForegroundColor Green
}

$gateway = $services | Where-Object { $_.Name -eq 'API Gateway' }
Start-DevService $gateway
if (-not (Wait-Port $gateway.Port 180)) {
  throw 'El gateway no levanto en 8080 tras 180 s. Revisa su ventana.'
}
Write-Host 'Gateway arriba.' -ForegroundColor Green

$frontend = $services | Where-Object { $_.Name -eq 'Frontend' }
Start-DevService $frontend

Write-Host ''
Write-Host 'Servicios iniciados.' -ForegroundColor Green
Write-Host 'UI:      http://localhost:3000' -ForegroundColor White
Write-Host 'Gateway: http://localhost:8080' -ForegroundColor White
Write-Host 'Eureka:  http://localhost:8761' -ForegroundColor White
Write-Host 'Cierra las ventanas de cada servicio para detenerlos.' -ForegroundColor Yellow
