# 3. Plan — dónde se toca

Todo en `server/`. **6 archivos modificados, 0 nuevos** (los de la cadena ya
existen). Sin dependencias nuevas. Sin tablas nuevas.

## Archivos modificados (6)

| Capa | Archivo | Cambio |
|------|---------|--------|
| Esquemas | `src/squemas/metricas.alumno.ts` | **Agrega** `AsistenciasInscripcionSchema` (solo `id_inscripcion`: `number` + `.min(1)`) + `AsistenciasInscripcionInputs`. Los 3 esquemas existentes intactos. |
| Data | `src/data/metricas.alumnos.data.ts` | **Agrega** `asistenciasPorInscripcion(id_inscripcion)` + interfaz `AsistenciaInscripcionRow` + entrada en `method`. Usa `listarEntidadSinPaginacion` con `entidad: "ASISTENCIAS_INSCRIPCION"`. |
| Respuestas | `src/respuestas/metricas.alumno.ts` | **Agrega** `MAPA_ASISTENCIAS_INSCRIPCION` (3 códigos). Los 3 mapas existentes intactos. |
| Servicio | `src/Servicio/metricas.alumnos.servicios.ts` | **Agrega** `asistenciasInscripcionServicio` + entrada en `method`. `.parse()` primero → data → traducción de códigos. |
| Controlador | `src/controladores/metricas.alumnos.controlador.ts` | **Agrega** handler `asistenciasInscripcion` + entrada en `method`. Suma 3 imports. |
| Rutas | `src/rutas/metricas.alumnos.principal.rutas.ts` | **Agrega** `GET /api/asistencias_inscripcion/:id_inscripcion` con `validarPermiso` + `soloAlumno`. El import de permisos pasa a `method as permisos` (para poder usar `soloAlumno`). |

**No se toca `app.ts`**: el router `principalAlumnos` ya está enganchado
(`app.use(principalAlumnos)`).

## El endpoint

```
GET /api/asistencias_inscripcion/:id_inscripcion
Cookie: token (rol alumno)
```

| Quién | Respuesta |
|-------|-----------|
| Sin token | 401 |
| Rol `usuario` o `administrador` | 403 `PROHIBIDO` (`soloAlumno`) |
| Rol `alumno`, con asistencias | 200 `ASISTENCIAS_INSCRIPCION_OK` + filas |
| Rol `alumno`, sin asistencias o id inexistente | 404 `SIN_ASISTENCIAS_INSCRIPCION` |
| `abc` o `0` en la URL | 400 `VALIDATION_ERROR` (Zod) |
| Cualquier `code` inesperado | 500 `ERROR_SERVIDOR` (salvavidas) |

## La SQL (data)

```sql
SELECT
  DATE_FORMAT(a.fecha, '%Y-%m-%d')        AS fecha,
  hc.id                                   AS id_horario_clase,
  hc.dia_semana,
  CONCAT(hc.hora_inicio, ' - ', hc.hora_fin) AS hora,
  tc.tipo                                 AS tipo_clase,
  n.nivel                                 AS nivel,
  CONCAT(p.nombre, ' ', p.apellido)       AS profesor
FROM asistencias a
INNER JOIN horarios_clases hc ON a.id_horario_clase = hc.id
INNER JOIN tipo_clase       tc ON hc.id_tipo_clase  = tc.id
INNER JOIN niveles           n ON hc.id_nivel       = n.id
INNER JOIN profesores        p ON hc.dni_profesor   = p.dni
WHERE a.id_inscripcion = ?
  AND a.estado = 'presente'
ORDER BY a.fecha DESC, hc.hora_inicio ASC;
```

- **4 `INNER JOIN`**: la asistencia siempre tiene su horario (la FK es
  `ON DELETE RESTRICT`), y el horario siempre tiene tipo, nivel y profesor
  (FK `NOT NULL` en `horarios_clases`). No hacen falta `LEFT JOIN`.
- **`profesores` se joina directo por `hc.dni_profesor = p.dni`**, igual que
  ya hace `obtenerClasesEscuelasHoy` en este mismo archivo (sin pasar por
  `profesores_en_escuela`).
- **Sin `COUNT(*) OVER()`**: no hay paginación.
- **`valores = [id_inscripcion]`**, un solo placeholder interpolado (sin
  inyección).

## El flujo completo

```
GET /api/asistencias_inscripcion/142  (cookie token, rol alumno)
  └─ permisos.validarPermiso      → llena req.usuario (401/403 si no)
  └─ permisos.soloAlumno          → 403 si rol ≠ alumno
  └─ controlador.asistenciasInscripcion
       └─ data = { id_inscripcion: Number("142") }
       └─ handleControladores(res, data, servicio, MAPA_ASISTENCIAS_INSCRIPCION)
            └─ servicio.asistenciasInscripcionServicio
                 ├─ AsistenciasInscripcionSchema.parse(data)   ← 400 si NaN o < 1
                 ├─ data.asistenciasPorInscripcion(142)
                 │    └─ listarEntidadSinPaginacion  →  ASISTENCIAS_INSCRIPCION_LISTED
                 │                                       o NO_ACTIVE_ASISTENCIAS_INSCRIPCION
                 ├─ NO_ACTIVE_*  → 404 SIN_ASISTENCIAS_INSCRIPCION
                 ├─ _LISTED      → 200 ASISTENCIAS_INSCRIPCION_OK (con filas)
                 └─ otro code    → 500 ERROR_SERVIDOR
```

## Los códigos del MAPA

| Código | HTTP | Cuándo |
|--------|------|--------|
| `ASISTENCIAS_INSCRIPCION_OK` | 200 | Hay filas |
| `SIN_ASISTENCIAS_INSCRIPCION` | 404 | Lista vacía o inscripción inexistente |
| `ERROR_SERVIDOR` | 500 | Respaldo ante cualquier `code` inesperado |

Los 403 y 401 los manda el middleware, no el MAPA (mismo esquema que
`anuncio_lista_publico`).

## Por qué el `import` de la ruta cambió

`metricas.alumnos.principal.rutas.ts` importaba `{ validarPermiso }` suelto.
`soloAlumno` **solo se exporta dentro del objeto `method`** de `permisos.ts`,
así que el archivo pasó a `import { method as permisos }` y las 3 rutas
existentes usan `permisos.validarPermiso`. Es el mismo middleware (en
`permisos.ts`, `validarPermiso` ya viene envuelto en `tryCatch` y `method` lo
envuelve otra vez: doble envoltura inofensiva, ya está en producción con
`anuncio.ruta.ts`). **Las 3 rutas quedan idénticas en comportamiento.**

## El frontend (fuera de alcance, anotado para la próxima spec)

`data_escuela_alumno` ya devuelve `inscripcion.id_inscripcion`, así que el
front solo necesita un fetch nuevo al hacer click en la inscripción:

```
GET /api/asistencias_inscripcion/${id_inscripcion}
```

Y pintar la lista con `fecha`, `dia_semana`, `hora`, `tipo_clase`, `nivel` y
`profesor`.
