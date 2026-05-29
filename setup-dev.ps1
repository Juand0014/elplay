# ElPlay - Setup del entorno de desarrollo
# Ejecutar como Administrador en PowerShell

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    WARN: $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "    ERROR: $msg" -ForegroundColor Red }

Write-Host "`n=== ElPlay Dev Setup ===" -ForegroundColor Magenta

# 1. Verificar Node.js
Write-Step "Verificando Node.js..."

$nodeInstalled = $false
try {
    $nodeVersion = & node --version 2>$null
    $nodeInstalled = $true
    Write-OK "Node.js encontrado: $nodeVersion"
} catch {}

if (-not $nodeInstalled) {
    Write-Warn "Node.js no encontrado. Instalando via winget..."
    try {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "Node.js instalado"
    } catch {
        Write-Fail "No se pudo instalar Node.js via winget."
        Write-Host "  Descarga manualmente: https://nodejs.org/en/download" -ForegroundColor Yellow
        exit 1
    }
}

$nodeVersionNum = (& node --version).TrimStart('v').Split('.')[0] -as [int]
if ($nodeVersionNum -lt 18) {
    Write-Fail "Node.js v$nodeVersionNum detectado. Se requiere v18+."
    Write-Host "  Actualiza desde https://nodejs.org/en/download" -ForegroundColor Yellow
    exit 1
}
Write-OK "Node.js v$nodeVersionNum (OK)"

# 2. Instalar pnpm
Write-Step "Verificando pnpm..."

$pnpmInstalled = $false
try {
    $pnpmVersion = & pnpm --version 2>$null
    $pnpmInstalled = $true
    Write-OK "pnpm encontrado: v$pnpmVersion"
} catch {}

if (-not $pnpmInstalled) {
    Write-Warn "pnpm no encontrado. Instalando via npm..."
    try {
        & npm install -g pnpm
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-OK "pnpm instalado"
    } catch {
        Write-Fail "No se pudo instalar pnpm. Corre manualmente: npm install -g pnpm"
        exit 1
    }
}

# 3. Verificar directorio del proyecto
Write-Step "Verificando proyecto..."

if (-not (Test-Path "D:\ElPlayApp\package.json")) {
    Write-Fail "No se encontro D:\ElPlayApp\package.json"
    exit 1
}
Write-OK "Proyecto encontrado en D:\ElPlayApp"

# 4. Instalar dependencias
Write-Step "Corriendo pnpm install..."
Set-Location "D:\ElPlayApp"

try {
    & pnpm install
    Write-OK "Dependencias instaladas"
} catch {
    Write-Fail "Error durante pnpm install. Revisa el error arriba."
    exit 1
}

# 5. Verificar .env
Write-Step "Verificando variables de entorno..."

$envMobile  = "D:\ElPlayApp\apps\mobile\.env"
$envExample = "D:\ElPlayApp\apps\mobile\.env.example"

if (-not (Test-Path $envMobile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envMobile
        Write-Warn ".env creado desde .env.example - recuerda llenar SUPABASE_URL y SUPABASE_ANON_KEY"
    } else {
        Write-Warn "Crea manualmente: D:\ElPlayApp\apps\mobile\.env"
    }
} else {
    Write-OK ".env ya existe"
}

# Resumen
Write-Host "`n=== Setup completado ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Proximos pasos:" -ForegroundColor White
Write-Host "  1. Configura D:\ElPlayApp\apps\mobile\.env con tus credenciales de Supabase"
Write-Host "  2. Corre: pnpm dev:mobile"
Write-Host "  3. Escanea el QR con Expo Go en tu telefono"
Write-Host ""
