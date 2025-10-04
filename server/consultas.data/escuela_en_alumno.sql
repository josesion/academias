CREATE TABLE alumnos_en_escuela (
    -- DNI del alumno, que es la clave foránea a la tabla 'alumnos'
    dni_alumno BIGINT NOT NULL,
    
    -- ID de la escuela, que es la clave foránea a la tabla 'escuelas'
    id_escuela INT NOT NULL,
    
    -- Fecha de alta en la escuela: registra cuándo se registró el alumno en esa academia
    fecha_alta_escuela DATE,
    
    -- Estado del alumno en esa escuela: permite saber si está activo, inactivo, etc.
    estado VARCHAR(50) DEFAULT 'activos',
    
    -- Definición de la clave primaria compuesta (la combinación de ambos campos debe ser única)
    PRIMARY KEY (dni_alumno, id_escuela),
    
    -- Definición de la clave foránea para la tabla 'alumnos'
    -- Esto asegura que solo se puedan registrar alumnos que existan en la tabla principal de alumnos
    FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno) ON DELETE CASCADE,
    
    -- Definición de la clave foránea para la tabla 'escuelas'
    -- Esto asegura que solo se puedan registrar alumnos en escuelas que existan
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela) ON DELETE CASCADE
);


INSERT INTO alumnos_en_escuela (dni_alumno, id_escuela, fecha_alta_escuela, estado) VALUES
-- Registros en la escuela 'Academia Ritmo Latino' (ID 1)
(20111220, 1, '2024-05-10', 'activos'),
(21222333, 1, '2024-03-22', 'activos'),
(24555666, 1, '2023-11-15', 'inactivos'),
(28999000, 1, '2024-01-08', 'activos'),
(33762570, 1, '2024-04-01', 'activos'),

-- Registros en la escuela 'Dance Fusion Studio' (ID 2)
(20111220, 2, '2024-06-15', 'activo'),
(25432109, 2, '2023-09-20', 'activo'),
(32109876, 2, '2024-02-28', 'activo'),

-- Registros en la escuela 'Ballet Clásico Argentino' (ID 3)
(22333444, 3, '2024-05-01', 'activo'),

-- Registros en la escuela 'Tango Salón y Milonga' (ID 4)
(23444555, 4, '2024-03-11', 'activo');