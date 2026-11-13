$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$services = @(
  @{ Name = 'Eureka'; Path = 'Libreria-MS-Eureka'; Command = '.\mvnw.cmd spring-boot:run' },
  @{ Name = 'Auth'; Path = 'Libreria-MS-Auth'; Command = '.\mvnw.cmd spring-boot:run' },
  @{ Name = 'Libros / Stock'; Path = 'Libreria-MS-Libros'; Command = '.\mvnw.cmd spring-boot:run' },
  @{ Name = 'Compras'; Path = 'Libreria-MS-Compras'; Command = "`$env:PURCHASES_SERVER_PORT='8081'; .\mvnw.cmd spring-boot:run" },
  @{ Name = 'Ventas'; Path = 'Libreria-MS-Rentas'; Command = '.\mvnw.cmd spring-boot:run' },
  @{ Name = 'API Gateway'; Path = 'Libreria-MS-Gateway'; Command = '.\mvnw.cmd spring-boot:run' },
  @{ Name = 'Frontend'; Path = 'Libreria-UI'; Command = 'pnpm dev' }
)

function Start-DevService {
  param(
    [string]$Name,
    [string]$Path,
    [string]$Command
  )

  $workingDirectory = Join-Path $root $Path
  if (-not (Test-Path $workingDirectory)) {
    throw "No se encontró la carpeta de $Name`: $workingDirectory"
  }

  Write-Host "Iniciando $Name..." -ForegroundColor Cyan
  $title = "BigoBooks - $Name"
  $escapedDirectory = $workingDirectory.Replace("'", "''")
  Start-Process powershell.exe -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    "`$Host.UI.RawUI.WindowTitle = '$title'; Set-Location '$escapedDirectory'; $Command"
  ) | Out-Null
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  throw 'Java no está disponible en PATH. Instala Java 21 y vuelve a intentar.'
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw 'pnpm no está disponible en PATH. Instala pnpm y vuelve a intentar.'
}

Write-Host 'BigoBooks DEV: se abrirá una ventana por servicio.' -ForegroundColor Green
Write-Host 'Asegúrate de tener PostgreSQL y Redis disponibles.' -ForegroundColor Yellow

foreach ($service in $services) {
  Start-DevService -Name $service.Name -Path $service.Path -Command $service.Command

  if ($service.Name -eq 'Eureka') {
    Write-Host 'Esperando a que Eureka inicialice...' -ForegroundColor DarkGray
    Start-Sleep -Seconds 8
  } elseif ($service.Name -eq 'Ventas') {
    Write-Host 'Esperando a que los servicios se registren antes del gateway...' -ForegroundColor DarkGray
    Start-Sleep -Seconds 5
  }
}

Write-Host ''
Write-Host 'Servicios iniciados.' -ForegroundColor Green
Write-Host 'UI:      http://localhost:3000' -ForegroundColor White
Write-Host 'Gateway: http://localhost:8080' -ForegroundColor White
Write-Host 'Eureka:  http://localhost:8761' -ForegroundColor White
Write-Host 'Cierra las ventanas de cada servicio para detenerlos.' -ForegroundColor Yellow
