/* Columnas de sala requeridas por el registro de asistencia QR. */
ALTER TABLE horarios_clases
    ADD COLUMN id_sala INT NULL AFTER id_tipo_clase;

ALTER TABLE asistencias
    ADD COLUMN id_sala INT NULL AFTER tipo_clase;

ALTER TABLE asistencias
    ADD COLUMN sala VARCHAR(100) NULL AFTER id_sala;