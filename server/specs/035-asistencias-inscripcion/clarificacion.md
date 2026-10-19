# 2. Clarificación — dudas y decisiones

| # | Pregunta | Decisión | Fecha |
|---|----------|----------|-------|
| 1 | ¿Dónde vive el endpoint nuevo? | En la cadena **`metricas.alumnos.*`** (`rutas/metricas.alumnos.principal.rutas.ts` → `controladores/metricas.alumnos.controlador.ts` → `Servicio/metricas.alumnos.servicios.ts` → `data/metricas.alumnos.data.ts`), que ya existe cerrada. Decisión del usuario: "vamos a ir `metricas.alumnos.principal.rutas.ts` y seguimos la ruta según dependa; el controlador, servicio y data ya están creados". | 2026-10-16 |
| 2 | ¿Cómo validamos que la inscripción le pertenece al alumno? | **No se valida contra el token.** El `id_inscripcion` lo manda el frontend, que ya lo tiene cargado desde `GET /api/data_escuela_alumno` (campo `inscripcion.id_inscripcion`). Decisión del usuario: "vamos a validar que venga con el id_inscripcion del frontend, que ahí ya estaría cargado, porque mi idea es que cuando el usuario haga click en la inscripción se despliegue el listado". **Riesgo anotado:** un alumno logueado podría leer el historial de otro alumno mandando un id ajeno por la URL; hoy nada lo frene. | 2026-10-16 |
| 3 | ¿Qué middlewares lleva la ruta? | **`validarPermiso` + `soloAlumno`** (`soloAlumno` ya existía desde la spec 018). Rol `usuario` y `administrador` reciben 403. | 2026-10-16 |
| 4 | ¿Qué asistencias se devuelven? | **Solo `estado = 'presente'`**. Es el único estado que consume clase de la inscripción (así lo cuenta `clases_restantes` en `consultas.data/asistencias.sql`). Decisión del usuario. | 2026-10-16 |
| 5 | ¿El listado pagina? | **No**, sin paginación. Usa `listarEntidadSinPaginacion`, igual que `horarioEscuela` en este mismo módulo. Decisión del usuario. | 2026-10-16 |
| 6 | ¿Qué campos trae cada fila? | **7 campos**: `fecha`, `id_horario_clase`, `dia_semana`, `hora` (CONCAT `"18:00 - 19:00"`), `tipo_clase`, `nivel`, `profesor`. Cubre lo pedido: "a qué clase fue, a qué hora y con qué profe". | 2026-10-16 |
| 7 | ¿Se filtra `estado`/`vigente` de `horarios_clases`? | **No.** Es historial: la clase pudo desactivarse después de que el alumno asistió y la asistencia ya está registrada. | 2026-10-16 |
| 8 | ¿Hace falta filtrar por `id_escuela` o `dni_alumno`? | **No.** `id_inscripcion` es la PK de `inscripciones`: identifica una inscripción única. | 2026-10-16 |
| 9 | ¿Dónde vive la spec? | `server/specs/035-asistencias-inscripcion/` (carpeta nueva en el backend). Las specs 001-034 viven en `cliente/specs/`; esta es de backend puro. | 2026-10-16 |
| 10 | El hook sin paginación devuelve `NO_ACTIVE_*` en vez de `_LISTED` con lista vacía. ¿Cómo se maneja? | El Servicio tiene un `if` **primero** para `NO_ACTIVE_ASISTENCIAS_INSCRIPCION` → devuelve 404 `SIN_ASISTENCIAS_INSCRIPCION`. Sin eso, la lista vacía caía en `ERROR_SERVIDOR` (500). Detalle que solo salta leyendo `hooks/funcionListarSinPag.ts`. | 2026-10-16 |

## Nota sobre el número de spec

La numeración del cliente llega hasta la 034 (`personalizacion-colores-perfil`).
Esta es la **035**, primera spec que vive en `server/specs/`.
