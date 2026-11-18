---
sessionId: session-261117-220005-1tc1
---

# Requirements

### Overview
Agregar un middleware `validarCajaAbierta` que verifique si la escuela del usuario tiene una caja abierta antes de permitir operaciones financieras. Si no hay caja abierta, bloquea el acceso con 403.

### Funcionalidad
- El middleware consulta la BD por `id_escuela` (ya disponible en `req.usuario` gracias a `validarPermiso`).
- Si hay caja abierta: pone `req.usuario.id_caja` y deja pasar.
- Si no hay caja abierta: responde 403 "No hay caja abierta" / "SIN_CAJA_ABIERTA".
- Se aplica en las rutas de caja que requieren caja abierta (movimientos, métricas, transferencias, retenciones, etc.).
- NO se aplica en `POST /api/caja_apertura` ni `GET /api/id_caja` (son las rutas que gestionan la apertura/cierre).

### Qué NO hace
- No modifica el token JWT.
- No cambia la lógica de abrir/cerrar caja.
- No afecta rutas que no requieran caja abierta.

# Technical Design

### Current Implementation
- **`src/utils/permisos.ts`**: middleware `validarPermiso` que lee el JWT, valida contra BD y pobla `req.usuario` con `{id, rol, id_escuela, tipo, flayer, usuario}`. También exporta `soloAdministrador`, `soloAlumno`, `soloUsuario`.
- **`src/data/caja.data.ts`**: función `idCajaAbierta` que consulta `SELECT id_caja FROM cajas WHERE estado = 'abierta' AND id_escuela = ?` usando `buscarExistenteEntidad`. Retorna `ID_CAJA_EXISTE` con `id_caja` o `ID_CAJA_NO_EXISTE`.
- **`src/Servicio/caja.servicio.ts`**: servicio `idCajaAbiertaServicio` que ya usa `idCajaAbierta` del data layer.
- **`src/rutas/caja.rutas.ts`**: rutas de caja con `validarPermiso` como único middleware de autenticación.

### Key Decisions
- **Middleware independiente**: no modificar `validarPermiso` para mantenerlo limpio. Un middleware nuevo que va después.
- **Consulta directa al data layer**: el middleware usa `caja.data.ts → idCajaAbierta` directamente (sin pasar por servicio) para evitar overhead de Zod en un middleware.
- **Bloqueo con 403**: si no hay caja abierta, el middleware responde 403. Las rutas que no requieran caja simplemente no usan el middleware.
- **Extensión de `req.usuario`**: agregar `id_caja?: number` al tipo global de `Request.usuario`.

### Proposed Changes
1. **`src/utils/permisos.ts`**:
   - Agregar `id_caja?: number` al `declare global` de `Request.usuario`.
   - Crear middleware `validarCajaAbierta`:
     - Lee `req.usuario.id_escuela`.
     - Llama a `caja.data.ts → method.idCajaAbierta({ id_escuela })`.
     - Si `ID_CAJA_EXISTE`: `req.usuario.id_caja = data.id_caja`; `next()`.
     - Si `ID_CAJA_NO_EXISTE`: `enviarResponseError(res, 403, "No hay caja abierta", "SIN_CAJA_ABIERTA")`.
   - Exportar en `method`.

2. **`src/rutas/caja.rutas.ts`**:
   - Importar `validarCajaAbierta` desde `permisos`.
   - Aplicar en rutas que requieren caja abierta (después de `validarPermiso`).
   - NO aplicar en `POST /api/caja_apertura` ni `GET /api/id_caja`.

### Architecture Diagram
```
graph LR
    A[Request] --> B[validarPermiso]
    B --> C{¿Token válido?}
    C -->|No| D[401/403]
    C -->|Sí| E[req.usuario poblado]
    E --> F[validarCajaAbierta]
    F --> G{¿Caja abierta?}
    G -->|No| H[403 SIN_CAJA_ABIERTA]
    G -->|Sí| I[req.usuario.id_caja set]
    I --> J[Controlador]
```

### Files Modified (Backend)
- `src/utils/permisos.ts` — ✅ middleware y tipo agregados.
- `src/rutas/caja.rutas.ts` — ✅ middleware aplicado en rutas, `:id_caja` eliminado de paths.
- `src/controladores/caja.controlador.ts` — ✅ 8 controladores usan `req.usuario.id_caja` (incluyendo `metricasCajaPrincipal` que se pasó por alto).
- `src/Servicio/caja.servicio.ts` — ✅ `cierreCajaServicio` valida retenciones activas antes de cerrar.
- `src/respuestas/caja.ts` — ✅ mapeo `RETENCIONES_ACTIVAS` agregado a `MAPA_CERRAR_CAJA`.
- `src/data/caja.data.ts` — ✅ `justificacion_retencion` eliminado: la justificación se guarda en `descripcion` sin formato adicional, solo el texto que escribió el usuario.
- `src/tipados/caja.data.tipado.ts` — ✅ `justificacion_retencion` quitado de `DetalleCajaMovimiento`.

### Files Modified (Frontend)
- `cliente/src/utils/idCaja.ts` — ⚠️ revertido a original (el frontend mantiene las consultas de `id_caja` como estaban).
- `cliente/src/hooks/caja/useCajaBase.ts` — ✅ agregado manejo del error `RETENCIONES_ACTIVAS` en `handleCerrarCaja`.
- `cliente/src/servicio/caja.fetch.ts` — ⚠️ revertido a original, luego se agregaron 5 exports faltantes (`transferenciaCaja`, `registrarRetencion`, `retencionesActivas`, `devolverRetencion`, `justificarRetencion`). Se corrigió `retencionesActivas` para enviar `id_caja` en el path.
- `cliente/src/tipadosTs/caja.typado.ts` — ⚠️ revertido a original, luego se agregó `RetencionActiva`, `EstadoRetencion`, `DataTransferenciaCaja`, `DataRetencionCaja`.
- `cliente/src/hooks/caja/useCajaMovimientos.ts` — ⚠️ revertido a original.
- `cliente/src/hooks/caja/useCajaMetricas.ts` — ⚠️ revertido a original.
- `cliente/src/hooks/caja/useCajaTransferencias.ts` — ✅ corregida la llamada a `retencionesActivas` para pasar `id_caja`.
- `cliente/src/pagina/privado/caja/Caja.tsx` — ✅ integrado con componentes de transferencia y retención, y panel de retenciones activas dentro del modal de cierre con bloqueo del botón. `justificacion_retencion` quitado.
- `cliente/src/hookNegocios/caja.usuario.ts` — ✅ agregadas las 5 funciones de transferencia y retención al config.
- `cliente/src/hooks/caja/caja.usuarios.ts` — ✅ integrado `useCajaTransferencias` y exportados los handlers.
- `cliente/src/reducers/cajaReducers.ts` — ✅ agregados tipos de acción y estado para transferencias y retenciones. `justificacion_retencion` quitado.
- `cliente/src/componentes/Caja/TransferenciaCaja/` — ✅ componente modal de transferencia.
- `cliente/src/componentes/Caja/RetencionCaja/` — ✅ componente modal de retención.
- `cliente/src/componentes/Caja/RetencionesPanel/` — ✅ panel lateral de retenciones activas.
- `cliente/src/componentes/Caja/MovimientoCaja/MovientoCaja.tsx` — ✅ `justificacion_retencion` quitado.
- `cliente/src/componentes/Informes/DetallesCaja.tsx` — ✅ `justificacion_retencion` quitado; la justificación se muestra en `descripcion`.
- `cliente/src/hooks/caja/useIUCaja.ts` — ✅ `justificacion_retencion` quitado.
- `cliente/src/tipadosTs/caja.typado.ts` — ✅ `justificacion_retencion` quitado de los tipos.

## Status
✅ Todo completado. Se unificó el campo de texto en `descripcion`: al resolver una retención (devolver o justificar), la justificación se guarda en `descripcion` con el formato "[Justificada: texto]" o "[Devuelta: texto]" en lugar de usar `justificacion_retencion` como columna separada. El campo `justificacion_retencion` dejó de usarse en el código (la columna BD permanece para no perder datos existentes). El modal de cierre de caja muestra el panel de retenciones activas con bloqueo del botón. Reiniciar el servidor para aplicar los cambios.