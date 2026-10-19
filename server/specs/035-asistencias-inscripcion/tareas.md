# 4. Tareas

> **Estado: IMPLEMENTADA el 16/10/2026.** Todo lo de abajo está hecho y
> probado contra el server local corriendo (nodemon sobre `build/`).

## Backend

- [x] `src/squemas/metricas.alumno.ts`: `AsistenciasInscripcionSchema`
      (`id_inscripcion`: `number` + `.min(1)`) + tipo inferido
      `AsistenciasInscripcionInputs`.
- [x] `src/data/metricas.alumnos.data.ts`: interfaz `AsistenciaInscripcionRow`
      (7 campos) + función `asistenciasPorInscripcion(id_inscripcion)` con
      `listarEntidadSinPaginacion` y `entidad: "ASISTENCIAS_INSCRIPCION"` +
      entrada en `method`.
- [x] `src/respuestas/metricas.alumno.ts`: `MAPA_ASISTENCIAS_INSCRIPCION`
      (`ASISTENCIAS_INSCRIPCION_OK` 200, `SIN_ASISTENCIAS_INSCRIPCION` 404,
      `ERROR_SERVIDOR` 500).
- [x] `src/Servicio/metricas.alumnos.servicios.ts`:
      `asistenciasInscripcionServicio` (`.parse()` → data → traducción de
      códigos, con el `if` del `NO_ACTIVE_*` antes del `_LISTED`) + entrada
      en `method` + 2 imports nuevos.
- [x] `src/controladores/metricas.alumnos.controlador.ts`: handler
      `asistenciasInscripcion` (`Number(req.params.id_inscripcion)`) + entrada
      en `method` + 3 imports nuevos.
- [x] `src/rutas/metricas.alumnos.principal.rutas.ts`: `GET
      /api/asistencias_inscripcion/:id_inscripcion` con `permisos.validarPermiso`
      + `permisos.soloAlumno`. El import pasa a `method as permisos`.
- [x] JSDoc en las 3 funciones nuevas (data, Servicio, controlador).
- [x] `npm run build` → **exit 0**.

## Verificado contra el server

- [x] 401 sin cookie.
- [x] 403 con rol `usuario` (`joseusuario`, id 3).
- [x] 403 con rol `administrador` (`josejefe`, id 37).
- [x] 200 con rol `alumno` + inscripción 142 → 10 filas, orden `fecha DESC`.
- [x] 200 con rol `alumno` + inscripción 139 → filas de otra inscripción.
- [x] 404 con inscripción inexistente (99999) → `SIN_ASISTENCIAS_INSCRIPCION`.
- [x] 400 con `abc` → `VALIDATION_ERROR` (`invalid_type`).
- [x] 400 con `0` → `VALIDATION_ERROR` (`too_small`).
- [x] Regresión: los 3 endpoints existentes de `metricas.alumnos` siguen en
      pie (el 401 del 4º endpoint confirma que la ruta está enganchada).

## Pendiente (fuera de alcance de esta spec)

- [ ] **Frontend**: el despliegue del historial al hacer click en la
  inscripción. El fetch sería `GET /api/asistencias_inscripcion/${id}` y el
  `id_inscripcion` ya lo tiene el front desde `data_escuela_alumno`.
- [ ] **Decisión de seguridad a revisar**: el endpoint no valida que la
  inscripción le pertenezca al alumno del token (ver `clarificacion.md` #2).
  Si algún día se quiere cerrar, la vía es resolver el DNI desde
  `req.usuario.id` y agregar `AND a.dni_alumno = ?` a la SQL.
