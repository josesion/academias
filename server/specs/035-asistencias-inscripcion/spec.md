# 1. Spec — Historial de asistencias de una inscripción

**Alcance**

- Endpoint nuevo `GET /api/asistencias_inscripcion/:id_inscripcion`, **solo para
  rol `alumno`**: devuelve el historial de asistencias `presente` de una
  inscripción, con los datos del horario al que el alumno asistió.
- Cada fila trae: `fecha`, `id_horario_clase`, `dia_semana`, `hora`
  (`"18:00 - 19:00"`), `tipo_clase`, `nivel` y `profesor`.
- Sin paginación, ordenado por `fecha DESC` (lo más reciente primero) y,
  a igual fecha, por `hora_inicio ASC`.
- Va enganchado a la cadena ya existente `metricas.alumnos.*`
  (ruta → controlador → Servicio → data), que no se rompe: se le suma un
  método más.
- El `id_inscripcion` ya lo tiene el frontend: lo recibe en
  `GET /api/data_escuela_alumno/:correo/:id_escuela` (campo `inscripcion.id_inscripcion`).

**Fuera de alcance**

- **No se toca el frontend.** El despliegue del listado al hacer click en la
  inscripción va en otra spec; esta es solo el endpoint.
- **No se tocan los 3 endpoints existentes** de `metricas.alumnos`
  (`metricas_principal_alumno`, `data_escuela_alumno`, `horario_escuela`).
- No se toca el módulo `asistencia.*` (alta de asistencia, ventana horaria,
  doble asistencia): es escritura, esto es lectura.
- No hay paginación ni filtros: el schema acepta **solo** `id_inscripcion`.
- No se crean tablas ni columnas nuevas.
- No se registra en `historial` (es una lectura del alumno sobre sus propios
  datos).

**Reglas de negocio / restricciones**

- **Se devuelven solo las `presente`**: es el único estado que consume clase
  de la inscripción (`consultas.data/asistencias.sql` — el cálculo de
  `clases_restantes` cuenta solo `estado = 'presente'`).
- **No se filtra `estado` ni `vigente` de `horarios_clases`.** Es un
  historial: la clase pudo desactivarse o ponerse no vigente **después** de
  que el alumno asistió, y la asistencia ya quedó registrada.
- `id_inscripcion` es la PK de `inscripciones`, así que no hace falta filtrar
  por `id_escuela` ni por `dni_alumno`: el id solo identifica una inscripción.
- El `id_inscripcion` viaja por `params` como **texto**: el controlador lo
  pasa a `Number()` y el Zod del Servicio frena el `NaN` (400). Zod vive solo
  en la capa Servicio (regla de la casa).
- La propiedad de la inscripción **no se valida contra el token** (decisión
  del usuario, ver `clarificacion.md` #2): el id lo manda el front ya
  cargado desde `data_escuela_alumno`.

**Criterios de aceptación**

- [x] `GET /api/asistencias_inscripcion/142` con token de **alumno** → 200 con
      las 10 filas de esa inscripción, ordenadas `fecha DESC`.
- [x] Con token de **usuario** → 403 `PROHIBIDO` (`soloAlumno`).
- [x] Con token de **administrador** → 403 `PROHIBIDO` (`soloAlumno`).
- [x] Sin token → 401.
- [x] Inscripción sin asistencias o inexistente → 404
      `SIN_ASISTENCIAS_INSCRIPCION` (no 500).
- [x] `id_inscripcion` no numérico (`abc`) → 400 `VALIDATION_ERROR`.
- [x] `id_inscripcion = 0` → 400 `VALIDATION_ERROR` (`.min(1)`).
- [x] Las 3 rutas existentes de `metricas.alumnos` siguen respondiendo igual.
- [x] `npm run build` → exit 0.

**Casos borde**

- **Lista vacía vs. error de servidor.** El hook `listarEntidadSinPaginacion`
  responde `NO_ACTIVE_ASISTENCIAS_INSCRIPCION` (con `error: true` y `data: []`)
  cuando no hay filas, **no** `_LISTED`. Si el servicio no lo distinguiera, la
  lista vacía caería en el respaldo `ERROR_SERVIDOR` (500) en vez de un 404.
  Por eso el servicio tiene el `if` del `NO_ACTIVE_*` **antes** de mirar el
  `_LISTED`.
- **`Number("abc")` da `NaN`, no lanza.** El controlador no valida nada (Zod
  está prohibido en controladores), así que el `NaN` llega al `.parse()` y
  Zod responde 400 con el mensaje propio del schema.
- **`Number("")` da `0`**, que cae en el `.min(1)` → también 400.
- **La asistencia es historial, no estado actual.** Un horario borrado o
  desactivado no borra las asistencias (la FK de `asistencias` a
  `horarios_clases` es `ON DELETE RESTRICT`), así que el `INNER JOIN` siempre
  encuentra la fila.
- **`hora` es un CONCAT**, no dos campos: es lo que pidió el usuario ("a qué
  hora") y es el mismo formato que ya devuelve `ClaseHoyRow.hora` en
  `obtenerClasesEscuelasHoy`.
- **El server corre sobre `build/`**: sin `npm run build` previo, nodemon
  sirve el código viejo y la ruta nueva da 404.
