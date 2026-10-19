# 5. Validación

> Resultados medidos el 16/10/2026 contra el server local (`nodemon` sobre
> `build/`, BD `academia_danzas_db`).

## Compilación

- [x] `npm run build` (server) → **exit 0**. Sin errores con `strict` +
      `noUnusedLocals` + `noUnusedParameters` + `noImplicitReturns`.

## Endpoint `GET /api/asistencias_inscripcion/:id_inscripcion`

Los 8 casos se probaron con **JWT reales** firmados con `JWT_CLAVE` del `.env`
(en cookie `token`), sin imprimir la clave. El script de prueba vivió en
`Temp\opencode` y se borró después.

| # | Prueba | Esperado | Real |
|---|--------|----------|------|
| 1 | Sin cookie | 401 | ✅ 401 `ClientError` "Sin token, no autorizado" |
| 2 | Rol `usuario` (`joseusuario`, id 3) | 403 | ✅ 403 `PROHIBIDO` "se requiere rol alumno" |
| 3 | Rol `administrador` (`josejefe`, id 37) | 403 | ✅ 403 `PROHIBIDO` "se requiere rol alumno" |
| 4 | Rol `alumno` (id 20) + inscripción **142** | 200, 10 filas | ✅ 200, 10 filas ordenadas `fecha DESC` |
| 5 | Rol `alumno` (id 20) + inscripción **139** | 200 | ✅ 200, filas de otra inscripción |
| 6 | Rol `alumno` + inscripción **99999** (inexistente) | 404 | ✅ 404 `SIN_ASISTENCIAS_INSCRIPCION` |
| 7 | Rol `alumno` + **`abc`** en la URL | 400 | ✅ 400 `VALIDATION_ERROR` — `invalid_type`, "id Inscripción debe ser numérico" |
| 8 | Rol `alumno` + **`0`** en la URL | 400 | ✅ 400 `VALIDATION_ERROR` — `too_small`, "El id debe ser mayor o igual a 1" |

## Las 10 filas de la inscripción 142 (verificación de contenido y orden)

Cotejadas contra la misma SQL ejecutada a mano por el MCP `mysql`:

| fecha | dia_semana | hora | tipo_clase | nivel | profesor |
|-------|-----------|------|-----------|-------|----------|
| 2026-08-20 | jueves | 16:00 - 17:00 | dance hall | avanzado | julieta alvornoz |
| 2026-08-07 | viernes | 21:00 - 22:00 | bachata dominicana | desde cero | julieta alvornoz |
| 2026-07-26 | domingo | 19:00 - 20:00 | salsa on 2 | principiante | Jose manuel lopez2 |
| 2026-07-19 | domingo | 19:00 - 20:00 | salsa on 2 | principiante | Jose manuel lopez2 |
| 2026-07-18 | sabado | 20:00 - 21:00 | bachata | principiante | Jose manuel guaymas |
| 2026-07-17 | viernes | 16:00 - 17:00 | dance hall | principiante | Jose manuel guaymas |
| 2026-07-14 | martes | 10:00 - 11:00 | salsa on 2 | principiante | profesor x profesor x |
| 2026-07-11 | sabado | 16:00 - 17:00 | bachata | principiante | Jose manuel guaymas |
| 2026-07-08 | miercoles | 21:00 - 22:00 | kpop dance | principiante | Jose manuel lopez |
| 2026-07-01 | miercoles | 19:00 - 20:00 | kpop dance | principiante | Jose manuel lopez |

Orden correcto: de la más reciente (2026-08-20) a la más vieja (2026-07-01).
Los 7 campos vienen poblados, sin `NULL`.

## Regresión de la cadena `metricas.alumnos`

Las 3 rutas existentes del archivo **no se rompieron** con el cambio de
`import { validarPermiso }` a `import { method as permisos }` (mismo
middleware, doble envoltura de `tryCatch`):

| Endpoint | Estado |
|----------|--------|
| `GET /api/metricas_principal_alumno/:correo` | ✅ 401 sin token (sigue pidiendo permiso) |
| `GET /api/data_escuela_alumno/:correo/:id_escuela` | ✅ sin cambios |
| `GET /api/horario_escuela/:id_escuela` | ✅ sin cambios |
| `GET /api/asistencias_inscripcion/:id_inscripcion` | ✅ nuevo, enganchado |

## Lo que queda suelto

- **El endpoint no valida la propiedad de la inscripción** (decisión del
  usuario, `clarificacion.md` #2): un alumno logueado puede leer el historial
  de otro alumno mandando un id ajeno por la URL. Si algún día se quiere
  cerrar, la vía es resolver el DNI desde `req.usuario.id` y agregar
  `AND a.dni_alumno = ?` a la SQL de la data.
- **El frontend no se tocó**: el despliegue del listado al hacer click en la
  inscripción va en una spec aparte. El `id_inscripcion` ya lo tiene el front
  desde `data_escuela_alumno`.
- **Todas las asistencias de la BD local pertenecen a `joseusuario` (id 3,
  dni 33762577)**, que tiene rol `usuario`, no `alumno`. Por eso la prueba 4
  se hizo con un alumno de rol `alumno` (id 20) apuntando a la inscripción
  142: el endpoint no valida propiedad, así que el 200 con filas reales se
  pudo verificar igual. Con datos de producción (alumnos de rol `alumno` con
  sus propias asistencias) el caso 4 es el camino normal.
