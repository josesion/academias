-- Tabla de plantillas de asistencia por escuela
CREATE TABLE IF NOT EXISTS plantillas_asistencia (
    id_plantilla INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plantilla_escuela
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
        ON DELETE RESTRICT
);