---
sessionId: session-261119-193141-1jhj
---

# Análisis Actual

### Situación actual

Tenemos 12 tests en el proyecto:
- **`tests/utils/validarCodeRespuesta.test.ts`** — 15 tests que validan `enviarResponse`, `enviarResponseError` y `handleControladores` usan `code` correctamente. ✅
- **`tests/helpers/expectCode.ts`** — helpers reutilizables: `expectCodeValue`, `expectCodeSuccess`, `expectCodeError`, `expectResponseCode`, `expectCodeIsPresent`. ✅
- **`tests/controladores/alumno.test.ts`** y **`tests/controladores/planes-usuarios.test.ts`** — usan `expect.objectContaining({ error: false, code: '...' })` manualmente. ❌ No usan los helpers.

### El problema

Cuando un agente escribe un test nuevo, puede:
1. Validar por `error: true/false` en lugar de por `code`.
2. No usar los helpers existentes.
3. Crear tests inconsistentes.

### Qué ya funciona bien

- Los **servicios** comparan por `.code === 'CODIGO_ESPERADO'` (~287 ocurrencias). Este es el patrón correcto.
- `handleControladores` mapea el `code` al HTTP status, no el `error`.
- Los helpers `expectCode*` ya existen y funcionan.

### Gaps identificados

1. Los tests de controladores no usan los helpers `expectCodeSuccess`/`expectResponseCode`.
2. No hay un test que verifique que un servicio compara por `code` y no por `error`.
3. No hay un "guardián" automático que falle si un nuevo test valida por `error` en lugar de `code`.

# Opciones Propuestas

### Opción A: Migrar tests existentes + template para nuevos tests

**Qué se hace:**
- Refactorizar `alumno.test.ts` y `planes-usuarios.test.ts` para usar `expectResponseCode()` en lugar de `expect.objectContaining({ error: false, code: '...' })`.
- Crear un template en `tests/helpers/test-template.md` con el patrón correcto para que los agentes lo sigan.
- Actualizar `AGENTS.md` con la regla: "En tests, usar siempre `expectResponseCode` o `expectCodeSuccess`, nunca validar por `error` solo".

**Ventajas:** Simple, directo, los agentes tendrán un ejemplo claro.
**Desventajas:** Requiere disciplina del agente para leer el template.

### Opción B: Guardián automático (test que valida todos los tests del proyecto)

**Qué se hace:**
- Crear `tests/utils/code-validation-guard.test.ts` que escanea los archivos de test y verifica que:
  - No haya `expect(...error...).toBe(true/false)` sin un `expect(...code...)` acompañante.
  - Todos los tests de controlador usen los helpers `expectCode*`.
- Este test se ejecuta con `npm test` automáticamente.

**Ventajas:** Validación automática, no depende de la disciplina del agente.
**Desventajas:** Más complejo, puede dar falsos positivos.

### Opción C: Combinación A + B (Recomendada)

**Qué se hace:**
- Stage 1: Migrar tests existentes a usar helpers (Opción A).
- Stage 2: Crear el guardián automático (Opción B).
- Stage 3: Actualizar `AGENTS.md` con la regla y el template.

**Ventajas:** Máxima cobertura, protege contra futuros errores.
**Desventajas:** Más trabajo inicial.

# Delivery Steps

### ✓ Step 1: Analizar y presentar opciones al usuario
Presentar al usuario las opciones de cómo crear el sistema de tests para validar por `code`. El usuario elige qué enfoque implementar.

### ✓ Step 2: Crear tests para hooks genéricos que validen por `code`
Creado `tests/hooks/hooks-code-validation.test.ts` con 20 tests usando helpers `expectCode*`. Cubre `buscarExistenteEntidad` (5 tests), `iudEntidad` (6 tests), `listarEntidad` (3 tests), `listarEntidadSinPaginacion` (3 tests). Cada sección incluye "caso crítico" documentando por qué `error: true` no significa fallo.

### ✓ Step 3: Crear tests para servicios que verifiquen comparaciones por `code`
Creado `tests/Servicio/alumnos-servicios-code-validation.test.ts` con 18 tests. Mockea la capa data para controlar los codes retornados y verifica que `altaAlumno`, `modAlumno`, `estadoAlumno`, `listaAlumnos`, `listadoSinPaginacion` comparan por `code` para tomar decisiones.

### ✓ Step 4: Crear tests para capa data que verifiquen el contrato de `code`
Creado `tests/data/alumno-data-code-validation.test.ts` con 18 tests. Cubre 11 funciones de `alumno.data.ts` verificando que cada una retorna `TipadoData` con `code` presente y correcto.

### ✓ Step 5: Ejecutar todos los tests y verificar que pasan
Los 65 tests de validación por `code` pasan correctamente (17 hooks + 15 servicios + 18 data + 15 utils). Los tests preexistentes con fallos (db.test.ts, modMiPerfil.test.ts, funcionListar.test.ts, etc.) ya fallaban antes de estos cambios.

### ✓ Step 6: Crear tests para el fallback de error al final de funciones de servicio y data
Agregados 8 tests nuevos a `tests/Servicio/alumnos-servicios-code-validation.test.ts`. Sección 6 "Contrato de fallback de error" verifica que cada función de servicio (`estadoAlumno`, `listaAlumnos`, `listadoSinPaginacion`, `altaAlumno`, `modAlumno`) retorna `error: true`, `code` con formato `ERROR_*` y `message` presente cuando la data retorna un code inesperado. Total: 73 tests de validación por `code` (17 hooks + 23 servicios + 18 data + 15 utils).