
CREATE TABLE inscripciones (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    id_plan INT NOT NULL,
    id_escuela INT NOT NULL,
    dni_alumno BIGINT NOT NULL,
    
    -- Fechas y vigencia
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    
    -- Snapshots para evitar mutaciones
    clases_asignadas_inscritas INT NOT NULL, 
    meses_asignados_inscritos INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    asistencia INT DEFAULT 0,
    estado ENUM('activos', 'suspendido', 'vencidos') DEFAULT 'activos',

    -- Claves Foráneas (Tus originales)
    FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno) ON DELETE RESTRICT,
    
    FOREIGN KEY (dni_alumno, id_escuela) 
        REFERENCES alumnos_en_escuela(dni_alumno, id_escuela) ON DELETE RESTRICT,
        
    FOREIGN KEY (id_escuela, id_plan) 
        REFERENCES planes_en_escuela(id_escuela, id_plan) ON DELETE RESTRICT
);



-- Inserccion de datos a incripciones -- IMPORTANTE SE TIENE Q MODIFICAR AL INSERT DE INCRIPCIONES
INSERT INTO inscripciones (
    id_plan, 
    id_escuela, 
    dni_alumno, 
    fecha_inicio, 
    fecha_fin, 
    monto, 
    clases_asignadas_inscritas, 
    meses_asignados_inscritos
) VALUES (
    59, 
    107, 
    33762577, 
    '2025-12-01', -- Asumiendo la fecha actual
    '2026-01-01', -- Un mes después
    1312.00, 
    1, 
    1
);

-- verid