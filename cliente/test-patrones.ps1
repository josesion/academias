# ====================================================================
# Test de patrones del proyecto — AGENTS.md compliance
# ====================================================================
# Este script verifica que el código del frontend siga los patrones
# definidos en AGENTS.md y la estructura del proyecto.
#
# Uso:  .\test-patrones.ps1
# ====================================================================

$ErrorActionPreference = "Stop"

# --- Configuración ---
$SrcRoot = Join-Path $PSScriptRoot "src"
$ComponentesPath = Join-Path $SrcRoot "componentes"
$HooksPath = Join-Path $SrcRoot "hooks"
$ReducersPath = Join-Path $SrcRoot "reducers"
$ServicioPath = Join-Path $SrcRoot "servicio"
$TipadosPath = Join-Path $SrcRoot "tipadosTs"
$PaginasPath = Join-Path $SrcRoot "pagina"

# Umbral de useState por componente: si un archivo TSX tiene más que este
# valor, se marca como advertencia (candidato a useReducer).
$UmbralUseState = 5

# Contadores globales
$totalChecks = 0
$passedChecks = 0
$failedChecks = 0
$warningChecks = 0

function Pasar {
    param($Msg)
    Write-Host "  [PASS] $Msg" -ForegroundColor Green
    $script:passedChecks++
    $script:totalChecks++
}

function Fallar {
    param($Msg)
    Write-Host "  [FAIL] $Msg" -ForegroundColor Red
    $script:failedChecks++
    $script:totalChecks++
}

function Advertencia {
    param($Msg)
    Write-Host "  [WARN] $Msg" -ForegroundColor Yellow
    $script:warningChecks++
    $script:totalChecks++
}

function Separador {
    Write-Host ""
    Write-Host ("=" * 70)
}

# ====================================================================
# TEST 1: No hay archivos .js sueltos en src/ (solo .ts/.tsx)
# ====================================================================
Separador
Write-Host "TEST 1: Archivos .js sueltos en src/" -ForegroundColor Cyan

$jsFiles = Get-ChildItem -Path $SrcRoot -Recurse -Filter "*.js" -File |
    Where-Object { $_.DirectoryName -notmatch "node_modules" }

if ($jsFiles.Count -eq 0) {
    Pasar "No se encontraron archivos .js en src/ (todo es .ts/.tsx)"
} else {
    Fallar "Se encontraron $($jsFiles.Count) archivo(s) .js en src/:"
    foreach ($f in $jsFiles) {
        Write-Host "    - $($f.FullName)" -ForegroundColor Red
    }
}

# ====================================================================
# TEST 2: Estructura de carpetas por funcionalidad
# ====================================================================
Separador
Write-Host "TEST 2: Estructura de carpetas por funcionalidad" -ForegroundColor Cyan

# Cada funcionalidad grande debe tener:
#   - Carpeta en componentes/ con sub-carpetas (una por sub-componente)
#   - Hook(s) en hooks/ con useReducer
#   - Reducer en reducers/
#   - Servicio en servicio/
#   - Tipos en tipadosTs/

# Funcionalidades conocidas que deben seguir el patrón
$Funcionalidades = @(
    @{ Nombre = "Caja";           Componentes = "Caja";           Hook = "caja";           Reducer = "cajaReducers";     Servicio = "caja.fetch";     Tipos = "caja.typado" },
    @{ Nombre = "Inscripciones";  Componentes = "Inscripciones";  Hook = "Inscripciones";  Reducer = "inscripcionReducer"; Servicio = "inscripciones.fetch"; Tipos = "inscripciones" },
    @{ Nombre = "Asistencia";     Componentes = "Horarios";       Hook = "asistencia";     Reducer = "asistenciaReducer"; Servicio = "asistencia.fetch"; Tipos = "asistencia.typado" },
    @{ Nombre = "Horarios";       Componentes = "Horarios";       Hook = "horarios";       Reducer = "horariosReducers"; Servicio = "horario.fetch";   Tipos = "horario" },
    @{ Nombre = "Flayers";        Componentes = "Flayers";        Hook = "flayers";        Reducer = "flayer.reducer";   Servicio = "flayer";          Tipos = $null }
)

foreach ($func in $Funcionalidades) {
    Write-Host ""
    Write-Host "  Funcionalidad: $($func.Nombre)" -ForegroundColor White

    # 2a: Carpeta de componentes existe
    $compPath = Join-Path $ComponentesPath $func.Componentes
    if (Test-Path $compPath) {
        $subFolders = Get-ChildItem -Path $compPath -Directory
        if ($subFolders.Count -gt 0) {
            Pasar "Componentes en carpetas: $($subFolders.Count) sub-carpetas en componentes/$($func.Componentes)/"
        } else {
            Advertencia "componentes/$($func.Componentes)/ existe pero sin sub-carpetas"
        }
    } else {
        Fallar "No existe componentes/$($func.Componentes)/"
    }

    # 2b: Hook con useReducer
    $hookFound = $false
    if (Test-Path $HooksPath) {
        $hookFiles = Get-ChildItem -Path $HooksPath -Recurse -Filter "*$($func.Hook)*" -File -ErrorAction SilentlyContinue
        if ($hookFiles) {
            foreach ($hf in $hookFiles) {
                $content = Get-Content $hf.FullName -Raw
                if ($content -match 'useReducer\(') {
                    $hookFound = $true
                    break
                }
            }
        }
    }
    # También buscar en hooks/caja/ (subcarpeta)
    if (-not $hookFound) {
        $hookSubPath = Join-Path $HooksPath $func.Hook
        if (Test-Path $hookSubPath) {
            $hookFiles = Get-ChildItem -Path $hookSubPath -File -ErrorAction SilentlyContinue
            if ($hookFiles) {
                foreach ($hf in $hookFiles) {
                    $content = Get-Content $hf.FullName -Raw
                    if ($content -match 'useReducer\(') {
                        $hookFound = $true
                        break
                    }
                }
            }
        }
    }

    if ($hookFound) {
        Pasar "Hook con useReducer encontrado para $($func.Nombre)"
    } else {
        Advertencia "No se encontró hook con useReducer para $($func.Nombre) (hooks/*$($func.Hook)*)"
    }

    # 2c: Reducer
    if ($func.Reducer) {
        $reducerFound = Get-ChildItem -Path $ReducersPath -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*$($func.Reducer)*" }
        if ($reducerFound) {
            Pasar "Reducer encontrado: $($reducerFound.Name)"
        } else {
            Advertencia "No se encontró reducer para $($func.Nombre) (reducers/*$($func.Reducer)*)"
        }
    }

    # 2d: Servicio
    if ($func.Servicio) {
        $servicioFound = Get-ChildItem -Path $ServicioPath -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*$($func.Servicio)*" }
        if ($servicioFound) {
            Pasar "Servicio encontrado: $($servicioFound.Name)"
        } else {
            Advertencia "No se encontró servicio para $($func.Nombre) (servicio/*$($func.Servicio)*)"
        }
    }

    # 2e: Tipos
    if ($func.Tipos) {
        $tiposFound = Get-ChildItem -Path $TipadosPath -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*$($func.Tipos)*" }
        if ($tiposFound) {
            Pasar "Tipos encontrados: $($tiposFound.Name)"
        } else {
            Advertencia "No se encontraron tipos para $($func.Nombre) (tipadosTs/*$($func.Tipos)*)"
        }
    }
}

# ====================================================================
# TEST 3: Componentes TSX con demasiados useState (candidatos a useReducer)
# ====================================================================
Separador
Write-Host "TEST 3: Componentes con muchos useState (umbral: $UmbralUseState)" -ForegroundColor Cyan

$tsxFiles = Get-ChildItem -Path $ComponentesPath -Recurse -Filter "*.tsx" -File

foreach ($tsx in $tsxFiles) {
    $content = Get-Content $tsx.FullName -Raw
    # Contar useState en el archivo
    $matches = [regex]::Matches($content, 'useState\(')
    $count = $matches.Count

    if ($count -gt $UmbralUseState) {
        $relativePath = $tsx.FullName.Replace($PSScriptRoot, "").TrimStart("\")
        Advertencia ("$relativePath tiene $count useState - candidato a useReducer")
    }
}

if ($warningChecks -eq 0 -or ($warningChecks -gt 0 -and $tsxFiles.Count -gt 0)) {
    # Contar cuántos pasaron
    $withManyState = 0
    foreach ($tsx in $tsxFiles) {
        $content = Get-Content $tsx.FullName -Raw
        $matches = [regex]::Matches($content, 'useState\(')
        if ($matches.Count -gt $UmbralUseState) { $withManyState++ }
    }
    $passedCount = $tsxFiles.Count - $withManyState
    if ($passedCount -gt 0) {
        Pasar "$passedCount de $($tsxFiles.Count) componentes tienen $passedCount con umbral de $UmbralUseState useState"
    }
}

# ====================================================================
# TEST 4: Componentes TSX sin archivo CSS asociado
# ====================================================================
Separador
Write-Host "TEST 4: Componentes TSX sin CSS asociado" -ForegroundColor Cyan

$tsxFiles = Get-ChildItem -Path $ComponentesPath -Recurse -Filter "*.tsx" -File
$sinCss = 0

foreach ($tsx in $tsxFiles) {
    $folder = $tsx.DirectoryName
    $tsxBaseName = [System.IO.Path]::GetFileNameWithoutExtension($tsx.Name)

    # Buscar CSS en la misma carpeta
    $cssFound = Get-ChildItem -Path $folder -Filter "*.css" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notlike "*.min.css" }

    # También verificar si el TSX importa un CSS
    $content = Get-Content $tsx.FullName -Raw
    $importaCss = $content -match 'import\s+.*\.css'

    if (-not $cssFound -and -not $importaCss) {
        # Verificar si es un componente que hereda estilos (no necesita CSS propio)
        $relativePath = $tsx.FullName.Replace($PSScriptRoot, "").TrimStart("\")
        # Algunos componentes genéricos pueden no tener CSS propio
        if ($folder -match "generales") {
            # En generales, verificar si importa CSS de otra parte
            if (-not $importaCss) {
                $sinCss++
                Write-Host "  [INFO] $relativePath sin CSS propio (en generales/)" -ForegroundColor DarkGray
            }
        } else {
            $sinCss++
            Advertencia "$relativePath no tiene CSS asociado ni importa CSS"
        }
    }
}

if ($sinCss -eq 0) {
    Pasar "Todos los componentes tienen CSS asociado o importan CSS"
} else {
    Fallar "$sinCss componente(s) sin CSS asociado"
}

# ====================================================================
# TEST 5: Componentes página delegan lógica en hooks
# ====================================================================
Separador
Write-Host "TEST 5: Páginas delegan lógica en hooks externos" -ForegroundColor Cyan

$paginaFiles = Get-ChildItem -Path $PaginasPath -Recurse -Filter "*.tsx" -File

$delegan = 0
$noDelegan = 0

foreach ($pf in $paginaFiles) {
    $content = Get-Content $pf.FullName -Raw
    $relativePath = $pf.FullName.Replace($PSScriptRoot, "").TrimStart("\")

    # Verificar si usa un hook personalizado (use* o *Logica o *Congif)
    $usaHook = $content -match 'use[A-Z]\w+' -or $content -match '\w+Logica\(' -or $content -match '\w+Congif\('

    # Contar useState directo en la página
    $useStateCount = ([regex]::Matches($content, 'useState\(')).Count

    if ($usaHook -and $useStateCount -le 3) {
        $delegan++
    } elseif ($useStateCount -gt 3) {
        $noDelegan++
        Advertencia "$relativePath tiene $useStateCount useState y no delega en hook externo"
    }
}

if ($delegan -gt 0) {
    Pasar "$delegan página(s) delegan lógica en hooks externos"
}
if ($noDelegan -gt 0) {
    Fallar "$noDelegan página(s) con lógica directa en lugar de delegar en hooks"
}

# ====================================================================
# TEST 6: Reducers existen en reducers/ (no en hooks/)
# ====================================================================
Separador
Write-Host "TEST 6: Reducers en la carpeta correcta (reducers/)" -ForegroundColor Cyan

$reducersInPath = Get-ChildItem -Path $ReducersPath -File -ErrorAction SilentlyContinue
if ($reducersInPath.Count -gt 0) {
    Pasar "$($reducersInPath.Count) reducer(s) en reducers/ (ubicación correcta)"
} else {
    Fallar "No se encontraron reducers en reducers/"
}

# Verificar que no haya reducers definidos en hooks/
$hooksWithReducer = 0
$hookTsFiles = Get-ChildItem -Path $HooksPath -Recurse -File -ErrorAction SilentlyContinue
foreach ($hf in $hookTsFiles) {
    $content = Get-Content $hf.FullName -Raw
    # Buscar función reducer definida en el hook (no solo useReducer)
    if ($content -match 'function\s+\w+Reducer' -or $content -match 'const\s+\w+Reducer\s*=') {
        $hooksWithReducer++
        $relativePath = $hf.FullName.Replace($PSScriptRoot, "").TrimStart("\")
        Advertencia "$relativePath define un reducer (debería estar en reducers/)"
    }
}

if ($hooksWithReducer -eq 0) {
    Pasar "No se encontraron reducers definidos en hooks/"
}

# ====================================================================
# TEST 7: Servicios en servicio/ (no en componentes ni páginas)
# ====================================================================
Separador
Write-Host "TEST 7: Servicios en la carpeta correcta (servicio/)" -ForegroundColor Cyan

$serviciosInPath = Get-ChildItem -Path $ServicioPath -File -ErrorAction SilentlyContinue
if ($serviciosInPath.Count -gt 0) {
    Pasar "$($serviciosInPath.Count) servicio(s) en servicio/ (ubicación correcta)"
} else {
    Fallar "No se encontraron servicios en servicio/"
}

# Verificar que no haya fetch directo en componentes
$fetchEnComponentes = 0
$tsxFiles = Get-ChildItem -Path $ComponentesPath -Recurse -Filter "*.tsx" -File
foreach ($tsx in $tsxFiles) {
    $content = Get-Content $tsx.FullName -Raw
    # Buscar fetch() o axios directo (no a través de servicio)
    if ($content -match '(fetch\(|axios\.)' -and $content -notmatch 'import.*servicio') {
        $fetchEnComponentes++
        $relativePath = $tsx.FullName.Replace($PSScriptRoot, "").TrimStart("\")
        Advertencia ("$relativePath parece hacer fetch directo")
    }
}

if ($fetchEnComponentes -eq 0) {
    Pasar 'No se encontro fetch directo en componentes'
}

# ====================================================================
# TEST 8: Tipos en tipadosTs/ (no duplicados en otros lugares)
# ====================================================================
Separador
Write-Host "TEST 8: Tipos en la carpeta correcta (tipadosTs/)" -ForegroundColor Cyan

$tiposInPath = Get-ChildItem -Path $TipadosPath -File -ErrorAction SilentlyContinue
if ($tiposInPath.Count -gt 0) {
    Pasar "$($tiposInPath.Count) archivo(s) de tipos en tipadosTs/ (ubicación correcta)"
} else {
    Fallar "No se encontraron tipos en tipadosTs/"
}

# ====================================================================
# TEST 9: Componentes en generales/ son reutilizables
# ====================================================================
Separador
Write-Host "TEST 9: Componentes generales son reutilizables" -ForegroundColor Cyan

$generalesPath = Join-Path $ComponentesPath "generales"
if (Test-Path $generalesPath) {
    $genComponents = Get-ChildItem -Path $generalesPath -Directory
    if ($genComponents.Count -gt 0) {
        Pasar "$($genComponents.Count) componente(s) general(es) en componentes/generales/"

        # Verificar que cada componente general sea usado en al menos 2 lugares
        $genTsxFiles = Get-ChildItem -Path $generalesPath -Recurse -Filter "*.tsx" -File
        foreach ($gen in $genTsxFiles) {
            $exportName = [regex]::Match($gen.Name, '([A-Z]\w+)').Groups[1].Value
            if (-not $exportName) { $exportName = [System.IO.Path]::GetFileNameWithoutExtension($gen.Name) }

            # Buscar imports de este componente en todo src/
            $usos = 0
            $allTsx = Get-ChildItem -Path $SrcRoot -Recurse -Filter "*.tsx" -File
            foreach ($t in $allTsx) {
                if ($t.FullName -eq $gen.FullName) { continue }
                $content = Get-Content $t.FullName -Raw
                if ($content -match $exportName) { $usos++ }
            }

            if ($usos -ge 2) {
                Pasar "$exportName usado en $usos lugares (reutilizable)"
            } elseif ($usos -eq 1) {
                Advertencia "$exportName usado solo en 1 lugar (¿debería ser general?)"
            }
        }
    }
} else {
    Fallar "No existe componentes/generales/"
}

# ====================================================================
# TEST 10: MEMORY.md y .gitignore
# ====================================================================
Separador
Write-Host "TEST 10: Archivos de agente en .gitignore" -ForegroundColor Cyan

$gitignorePath = Join-Path $PSScriptRoot ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw

    if ($gitignoreContent -match 'MEMORY\.md') {
        Pasar "MEMORY.md está en .gitignore"
    } else {
        Fallar "MEMORY.md NO está en .gitignore"
    }

    if ($gitignoreContent -match 'opencode\.json') {
        Pasar "opencode.json está en .gitignore"
    } else {
        Fallar "opencode.json NO está en .gitignore"
    }
} else {
    Fallar ".gitignore no encontrado en la raíz del proyecto"
}

# ====================================================================
# RESUMEN
# ====================================================================
Separador
Write-Host ""
Write-Host "RESUMEN DE TESTS" -ForegroundColor White
Write-Host ("-" * 40)
Write-Host "  Total:    $totalChecks"
Write-Host "  Passed:   $passedChecks" -ForegroundColor Green
Write-Host "  Failed:   $failedChecks" -ForegroundColor Red
Write-Host "  Warnings: $warningChecks" -ForegroundColor Yellow
Write-Host ""

if ($failedChecks -gt 0) {
    Write-Host "Resultado: ALGUNOS TESTS FALLARON" -ForegroundColor Red
    Write-Host ""
    exit 1
} else {
    Write-Host "Resultado: TODOS LOS TESTS CRÍTICOS PASARON" -ForegroundColor Green
    if ($warningChecks -gt 0) {
        Write-Host ('  (' + $warningChecks + ' advertencias a revisar)') -ForegroundColor Yellow
    }
    Write-Host ""
    exit 0
}
