-- Estructura de la tabla horarios_clases con tipos de hora como String (VARCHAR)
CREATE TABLE horarios_clases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_escuela INT NOT NULL,

    dni_profesor VARCHAR(20) NOT NULL,

    id_nivel INT NOT NULL,
    id_tipo_clase INT NOT NULL,

    -- Día de la semana como ENUM
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    
    -- Horas modificadas a VARCHAR para manejo flexible como strings
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,

    fecha_creacion DATE NOT NULL,
    estado ENUM('activos', 'inactivos', 'suspendido') NOT NULL DEFAULT 'activos',
    vigente BOOLEAN NOT NULL DEFAULT TRUE,

    -- FK a profesores_en_escuela (relación compuesta profesor + escuela)
    FOREIGN KEY (dni_profesor, id_escuela)
        REFERENCES profesores_en_escuela(dni_profesor, id_escuela)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Nivel
    FOREIGN KEY (id_nivel)
        REFERENCES niveles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Tipo de clase
    FOREIGN KEY (id_tipo_clase)
        REFERENCES tipo_clase(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Escuela
    FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- Insertar horarios_clases --
INSERT INTO horarios_clases (
    id_escuela, dni_profesor, id_nivel, id_tipo_clase,
    dia_semana, hora_inicio, hora_fin, fecha_creacion, estado
)
VALUES
-- Clase 1
(107, '33700600', 1, 1, 'lunes', '18:00:00', '19:00:00', '2025-12-12', 'activos'),

-- Clase 2
(107, '33762578', 2, 5, 'martes', '19:00:00', '20:30:00', '2025-12-12', 'activos'),

-- Clase 3
(107, '33762582', 3, 3, 'miércoles', '20:00:00', '21:00:00', '2025-12-12', 'activos'),

-- Clase 4
(107, '33762590', 4, 4, 'jueves', '18:30:00', '19:30:00', '2025-12-12', 'activos'),

-- Clase 5
(107, '33700600', 2, 1, 'viernes', '17:00:00', '18:00:00', '2025-12-12', 'activos');



-- Listado con inner join para ver los datos en vez de ids --

SELECT 
    hc.id AS id_horario,

    e.nombre_propietario AS escuela_nombre,   -- o la columna que uses como nombre real
    hc.id_escuela,

    p.nombre AS profesor_nombre,
    p.apellido AS profesor_apellido,

    n.nivel AS nivel_descripcion,
    tc.tipo AS tipo_clase_descripcion,

    hc.dia_semana,
    hc.hora_inicio,
    hc.hora_fin,
    hc.estado,
    hc.fecha_creacion

FROM horarios_clases hc

-- Profesor + datos personales
JOIN profesores_en_escuela pe
    ON pe.dni_profesor = hc.dni_profesor
   AND pe.id_escuela = hc.id_escuela

JOIN profesores p
    ON p.dni = hc.dni_profesor

-- Nivel
JOIN niveles n
    ON n.id = hc.id_nivel

-- Tipo de clase
JOIN tipo_clase tc
    ON tc.id = hc.id_tipo_clase

-- Escuela
JOIN escuelas e
    ON e.id_escuela = hc.id_escuela

WHERE hc.id_escuela = 107;
