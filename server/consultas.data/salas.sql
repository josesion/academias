-- Estructura de la tabla salas (compartida entre baile y gym)
CREATE TABLE salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_escuela INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    capacidad INT DEFAULT NULL,
    estado ENUM('activos', 'inactivos') NOT NULL DEFAULT 'activos',
    vigente BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATE NOT NULL,

    FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Agregar columna id_sala a horarios_clases (Baile)
ALTER TABLE horarios_clases
    ADD COLUMN id_sala INT NULL AFTER id_tipo_clase,
    ADD FOREIGN KEY (id_sala)
        REFERENCES salas(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;

-- Inserciones de ejemplo --
INSERT INTO salas (id_escuela, nombre, capacidad, fecha_creacion, estado)
VALUES
    (107, 'Sala 1', 40, CURDATE(), 'activos'),
    (107, 'Sala 2', 30, CURDATE(), 'activos'),
    (107, 'Sala de Spinning', 20, CURDATE(), 'activos');

-- Consulta para listar salas de una escuela --
SELECT 
    s.id,
    s.nombre,
    s.capacidad,
    s.estado,
    e.nombre_propietario AS escuela_nombre
FROM salas s
JOIN escuelas e ON e.id_escuela = s.id_escuela
WHERE s.id_escuela = 107
  AND s.vigente = TRUE;

-- Modificar una sala --
UPDATE salas
SET nombre = 'Sala Principal', capacidad = 50
WHERE id = 1 AND id_escuela = 107;

-- Cambiar el estado de una sala --
UPDATE salas
SET estado = 'inactivos', vigente = FALSE
WHERE id = 1 AND id_escuela = 107;

-- Asignar una sala a un horario existente --
UPDATE horarios_clases
SET id_sala = 1
WHERE id = 1 AND id_escuela = 107;
