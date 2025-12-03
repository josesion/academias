CREATE TABLE inscripciones (
    -- Clave primaria autoincremental para identificar cada inscripción
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    
    -- ID del Plan: Clave foránea que apunta a la tabla de planes
    -- Se usará en conjunto con id_escuela para garantizar la existencia del plan en esa escuela.
    id_plan INT NOT NULL,
    
    -- ID de la Escuela: Clave foránea que apunta a la tabla de escuelas
    -- Fundamental para segmentar la inscripción por academia.
    id_escuela INT NOT NULL,
    
    -- DNI del Alumno: Clave foránea que apunta a la tabla de alumnos
    -- Asegura que solo se inscriban alumnos existentes.
    dni_alumno BIGINT NOT NULL,
    
    -- Fecha de Inicio: Almacenado como DATE.
    fecha_inicio DATE NOT NULL,
    
    -- Fecha de Fin: Almacenado como DATE.
    fecha_fin DATE NULL,
    
    -- Monto Total Pagado o a Pagar: Usa DECIMAL para precisión financiera.
    monto DECIMAL(10, 2) NOT NULL,

    -- Campos de histórico/snapshot del plan al momento de la inscripción para evitar mutación de datos
    clases_asignadas_inscritas INT NOT NULL, 
    meses_asignados_inscritos INT NOT NULL,
    
    -- Nuevo campo para el seguimiento de la asistencia (ej. número de clases tomadas).
    asistencia INT DEFAULT 0,
    
     -- Estado de la Inscripción: Ahora usa ENUM para limitar los valores a 'activos' o 'suspendido'.
    estado ENUM('activos', 'suspendido', 'vencidos') DEFAULT 'activos',
    
    
    -- ----------------------------------------------------
    -- Definición de Claves Foráneas
    -- ----------------------------------------------------

    -- FK a alumnos: Garantiza que el DNI exista en la tabla principal de alumnos
    FOREIGN KEY (dni_alumno) 
        REFERENCES alumnos(dni_alumno)
        ON DELETE RESTRICT,
        
    -- NUEVA FK compuesta a alumnos_en_escuela: 
    -- Asegura que el alumno esté efectivamente dado de alta en la escuela antes de inscribirse en un plan.
    FOREIGN KEY (dni_alumno, id_escuela) 
        REFERENCES alumnos_en_escuela(dni_alumno, id_escuela)
        ON DELETE RESTRICT,
        
    -- FK compuesta a planes_en_escuela: 
    -- Es crucial asegurar que el plan (id_plan) esté disponible en la escuela (id_escuela).
    FOREIGN KEY (id_escuela, id_plan) 
        REFERENCES planes_en_escuela(id_escuela, id_plan)
        ON DELETE RESTRICT
);

-- Inserccion de datos a incripciones --
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