/* ============================================================================
   048 - Foto del horario en cada asistencia (snapshot)

   1) Nueve columnas en `asistencias` con lo que el horario decia ese dia.
   2) Backfill de las filas ya registradas con el horario ACTUAL.

   POR QUE: hasta hoy `asistencias` guardaba solo `id_horario_clase`. Todo lo que
   muestra el listado (profesor, nivel, tipo, dia, hora) se leia del horario
   VIGENTE, asi que editar un horario cambiaba el historico hacia atras. Con estas
   columnas la asistencia queda congelada en el momento del alta.

   Idempotente: `migrar.ts` ignora en silencio ER_DUP_FIELDNAME (1060), asi que
   volver a correr este archivo no rompe (solo el backfill se re-ejecutaria, y su
   WHERE `id_nivel IS NULL` lo hace no destructivo).

   OJO (runner): `migrar.ts` descarta toda sentencia cuyo texto empiece con "--".
   Por eso los comentarios de nivel sentencia son de bloque.

   ORDEN: `asistencias.sql` < `asistencias_snapshot.sql` (alfabetico), asi que en
   una base nueva el CREATE TABLE ya trae las columnas y el ALTER da 1060.
   ============================================================================ */

/* 1) COLUMNAS DE FOTO ========================================================
   - Guardamos IDs Y textos: los IDs permiten filtrar, los textos congelan lo que
     decia el catalogo. Con solo IDs, renombrar "Principiante" a "Nivel 1"
     seguiria cambiando el historico.
   - NULL en todas: las filas viejas se completan en el backfill, y las nuevas las
     completa `asistenciaAlta`.
   - SIN FK en las columnas de foto a proposito: si se borra o inactiva un
     nivel/tipo, la asistencia historica no debe romperse ni bloquear el borrado.
     `id_horario_clase` conserva su FK: sigue siendo la trazabilidad.
   - `hora_inicio`/`hora_fin` van como TIME y no VARCHAR para normalizar de una
     vez los formatos mezclados del horario ('17:00' y '17:00:00').
   ============================================================================ */

ALTER TABLE asistencias
    ADD COLUMN id_nivel INT NULL
        COMMENT 'Foto: horarios_clases.id_nivel al registrar'
        AFTER id_horario_clase,
    ADD COLUMN id_tipo_clase INT NULL
        COMMENT 'Foto: horarios_clases.id_tipo_clase al registrar'
        AFTER id_nivel,
    ADD COLUMN dni_profesor VARCHAR(20) NULL
        COMMENT 'Foto: horarios_clases.dni_profesor al registrar'
        AFTER id_tipo_clase,
    ADD COLUMN dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NULL
        COMMENT 'Foto: dia declarado por el horario (sin tildes)'
        AFTER dni_profesor,
    ADD COLUMN hora_inicio TIME NULL
        COMMENT 'Foto: TIME(horarios_clases.hora_inicio), normalizada'
        AFTER dia_semana,
    ADD COLUMN hora_fin TIME NULL
        COMMENT 'Foto: TIME(horarios_clases.hora_fin), normalizada'
        AFTER hora_inicio,
    ADD COLUMN nombre_profesor VARCHAR(220) NULL
        COMMENT 'Foto: CONCAT(profesores.nombre, " ", profesores.apellido). 220 = 100 + 1 + 100 del peor caso teorico, con margen'
        AFTER hora_fin,
    ADD COLUMN nivel VARCHAR(100) NULL
        COMMENT 'Foto: niveles.nivel'
        AFTER nombre_profesor,
    ADD COLUMN tipo_clase VARCHAR(100) NULL
        COMMENT 'Foto: tipo_clase.tipo'
        AFTER nivel;

/* 2) BACKFILL ================================================================
   Las asistencias ya registradas NO tienen foto y el pasado no se puede
   recuperar. Se completa con el horario ACTUAL: quedan blindadas hacia adelante,
   pero su foto es "la de hoy", no la del dia en que se tomo la asistencia.

   `WHERE a.id_nivel IS NULL` es el candado de re-ejecucion: una fila con foto
   real nunca se pisa.

   Los LEFT JOIN son defensa: las FK RESTRICT garantizan que profesor/nivel/tipo
   existen, pero si alguna limpieza manual los dejo colgados, la fila se completa
   igual (con NULL en ese texto) en vez de desaparecer del UPDATE.
   ============================================================================ */

UPDATE asistencias a
INNER JOIN horarios_clases hc
        ON hc.id = a.id_horario_clase
       AND hc.id_escuela = a.id_escuela
LEFT  JOIN profesores p   ON p.dni = hc.dni_profesor
LEFT  JOIN niveles n      ON n.id = hc.id_nivel
LEFT  JOIN tipo_clase tc  ON tc.id = hc.id_tipo_clase
SET a.id_nivel        = hc.id_nivel,
    a.id_tipo_clase   = hc.id_tipo_clase,
    a.dni_profesor    = hc.dni_profesor,
    a.dia_semana      = hc.dia_semana,
    a.hora_inicio     = TIME(hc.hora_inicio),
    a.hora_fin        = TIME(hc.hora_fin),
    a.nombre_profesor = NULLIF(TRIM(CONCAT(IFNULL(p.nombre, ''), ' ', IFNULL(p.apellido, ''))), ''),
    a.nivel           = n.nivel,
    a.tipo_clase      = tc.tipo
WHERE a.id_nivel IS NULL;
