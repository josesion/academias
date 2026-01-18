CREATE TABLE inscripciones (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    id_plan INT NOT NULL,
    id_escuela INT NOT NULL,
    dni_alumno BIGINT NOT NULL,
    
    -- Datos de la transacción
    id_caja INT NULL, -- Vínculo con el turno de caja actual
    medio_pago ENUM('efectivo', 'transferencia', 'otros') DEFAULT 'efectivo',
    monto DECIMAL(10, 2) NOT NULL, -- Lo que costó el plan
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Fechas y vigencia
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    
    -- Snapshots para evitar mutaciones si el plan cambia de precio/clases en el futuro
    clases_asignadas_inscritas INT NOT NULL, 
    meses_asignados_inscritos INT NOT NULL,
    asistencia INT DEFAULT 0,
    estado ENUM('activos', 'suspendido', 'vencidos') DEFAULT 'activos',

    -- Claves Foráneas
    FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno) ON DELETE RESTRICT,
    
    FOREIGN KEY (dni_alumno, id_escuela) 
        REFERENCES alumnos_en_escuela(dni_alumno, id_escuela) ON DELETE RESTRICT,
        
    FOREIGN KEY (id_escuela, id_plan) 
        REFERENCES planes_en_escuela(id_escuela, id_plan) ON DELETE RESTRICT,

    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja) ON DELETE RESTRICT
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