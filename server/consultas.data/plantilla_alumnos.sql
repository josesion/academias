-- Tabla de alumnos asociados a una plantilla de asistencia
CREATE TABLE IF NOT EXISTS plantilla_alumnos (
    id_plantilla INT NOT NULL,
    dni_alumno BIGINT NOT NULL,
    PRIMARY KEY (id_plantilla, dni_alumno),
    CONSTRAINT fk_plantilla_alumnos_plantilla
        FOREIGN KEY (id_plantilla) REFERENCES plantillas_asistencia(id_plantilla)
        ON DELETE CASCADE,
    CONSTRAINT fk_plantilla_alumnos_alumno
        FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno)
        ON DELETE RESTRICT
);