-- Estructura de la tabla horarios_gym (separada de horarios_clases)
-- Permite clases grupales con profesor y sala, y salas de musculación sin profesor
CREATE TABLE horarios_gym (
    id INT AUTO_INCREMENT PRIMARY KEY,

    id_escuela INT NOT NULL,

    -- Profesor opcional (NULL para salas de musculación sin profesor)
    dni_profesor VARCHAR(20) NULL,

    -- Sala obligatoria
    id_sala INT NOT NULL,

    -- Tipo de clase opcional (NULL para sala de musculación)
    id_tipo_clase INT NULL,

    -- Día de la semana como ENUM
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    
    -- Horas como VARCHAR
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,

    fecha_creacion DATE NOT NULL,
    estado ENUM('activos', 'inactivos', 'suspendido') NOT NULL DEFAULT 'activos',
    vigente BOOLEAN NOT NULL DEFAULT TRUE,

    -- Sala obligatoria
    FOREIGN KEY (id_sala)
        REFERENCES salas(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    -- Tipo de clase (nullable)
    FOREIGN KEY (id_tipo_clase)
        REFERENCES tipo_clase(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    -- Escuela
    FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Insertar ejemplos --
INSERT INTO horarios_gym (
    id_escuela, dni_profesor, id_sala, id_tipo_clase,
    dia_semana, hora_inicio, hora_fin, fecha_creacion, estado
)
VALUES
-- Clase grupal: Spinning con profesor
(107, '33700600', 3, 6, 'lunes', '18:00:00', '19:00:00', '2025-12-12', 'activos'),

-- Sala de musculación sin profesor
(107, NULL, 1, NULL, 'martes', '08:00:00', '22:00:00', '2025-12-12', 'activos');

-- Listado con JOINs --
SELECT 
    hg.id AS id_horario,
    hg.id_escuela,

    p.nombre AS profesor_nombre,
    p.apellido AS profesor_apellido,

    s.id AS id_sala,
    s.nombre AS sala_nombre,

    tc.tipo AS tipo_clase_descripcion,

    hg.dia_semana,
    hg.hora_inicio,
    hg.hora_fin,
    hg.estado,
    hg.fecha_creacion

FROM horarios_gym hg

LEFT JOIN profesores_en_escuela pe
    ON pe.dni_profesor = hg.dni_profesor
   AND pe.id_escuela = hg.id_escuela

LEFT JOIN profesores p
    ON p.dni = hg.dni_profesor

JOIN salas s
    ON s.id = hg.id_sala

LEFT JOIN tipo_clase tc
    ON tc.id = hg.id_tipo_clase

WHERE hg.id_escuela = 107
  AND hg.vigente = TRUE;

-- Modificar un horario gym --
UPDATE horarios_gym
SET
    dni_profesor   = '33762578',
    id_sala        = 2,
    id_tipo_clase  = 7,
    estado         = 'inactivos',
    vigente        = FALSE
WHERE id = 1
  AND id_escuela = 107;
