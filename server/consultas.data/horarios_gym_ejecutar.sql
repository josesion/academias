-- Ejecutar este script para crear la tabla horarios_gym

CREATE TABLE IF NOT EXISTS horarios_gym (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_escuela INT NOT NULL,
    dni_profesor VARCHAR(20) NULL,
    id_sala INT NOT NULL,
    id_tipo_clase INT NULL,
    dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    fecha_creacion DATE NOT NULL,
    estado ENUM('activos', 'inactivos', 'suspendido') NOT NULL DEFAULT 'activos',
    vigente BOOLEAN NOT NULL DEFAULT TRUE,

    FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (id_sala)
        REFERENCES salas(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (id_tipo_clase)
        REFERENCES tipo_clase(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- Insertar ejemplos para el gym de usuario2 (id 1002)
INSERT INTO horarios_gym (
    id_escuela, dni_profesor, id_sala, id_tipo_clase,
    dia_semana, hora_inicio, hora_fin, fecha_creacion, estado
)
VALUES
-- Sala de musculación sin profesor (martes a domingo)
(1002, NULL, 4, NULL, 'lunes', '08:00:00', '22:00:00', CURDATE(), 'activos'),
(1002, NULL, 4, NULL, 'martes', '08:00:00', '22:00:00', CURDATE(), 'activos'),
(1002, NULL, 4, NULL, 'miercoles', '08:00:00', '22:00:00', CURDATE(), 'activos'),
(1002, NULL, 4, NULL, 'jueves', '08:00:00', '22:00:00', CURDATE(), 'activos'),
(1002, NULL, 4, NULL, 'viernes', '08:00:00', '22:00:00', CURDATE(), 'activos'),
(1002, NULL, 4, NULL, 'sabado', '09:00:00', '18:00:00', CURDATE(), 'activos');
