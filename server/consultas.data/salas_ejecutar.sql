-- Ejecutar este script para crear la tabla salas y agregar id_sala a horarios_clases

-- 1) Crear tabla salas (compartida entre baile y gym)
CREATE TABLE IF NOT EXISTS salas (
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

-- 2) Verificar y agregar columna id_sala a horarios_clases
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'horarios_clases' 
    AND COLUMN_NAME = 'id_sala'
);

SET @sql = IF(@column_exists > 0, '', 'ALTER TABLE horarios_clases ADD COLUMN id_sala INT NULL AFTER id_tipo_clase');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Verificar y agregar foreign key si no existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'horarios_clases'
    AND CONSTRAINT_NAME = 'fk_horarios_sala'
);

SET @sql_fk = IF(@fk_exists > 0, '', 'ALTER TABLE horarios_clases ADD CONSTRAINT fk_horarios_sala FOREIGN KEY (id_sala) REFERENCES salas(id) ON UPDATE CASCADE ON DELETE SET NULL');
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- 4) Crear salas para la escuela de usuario1 (Baile - id 1001)
INSERT INTO salas (id_escuela, nombre, capacidad, fecha_creacion, estado)
VALUES
    (1001, 'Sala Salsa', 40, CURDATE(), 'activos'),
    (1001, 'Sala Bachata', 30, CURDATE(), 'activos');

-- 5) Crear salas para la escuela de usuario2 (Gym - id 1002)
INSERT INTO salas (id_escuela, nombre, capacidad, fecha_creacion, estado)
VALUES
    (1002, 'Sala Spinning', 20, CURDATE(), 'activos'),
    (1002, 'Sala Musculación', 50, CURDATE(), 'activos'),
    (1002, 'Sala Crossfit', 35, CURDATE(), 'activos');
