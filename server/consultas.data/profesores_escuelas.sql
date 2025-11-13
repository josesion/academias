CREATE TABLE profesores_en_escuela (
    -- Claves Primarias y Foráneas
    dni_profesor VARCHAR(20) NOT NULL,
    id_escuela INT NOT NULL, 

    -- Datos de la Relación
    estado VARCHAR(20) NOT NULL DEFAULT 'activos', -- Usando VARCHAR según tu solicitud
    fecha_creacion DATE NOT NULL ,
    fecha_baja DATE NULL, 

    -- Definición de Clave Primaria Compuesta
    PRIMARY KEY (dni_profesor, id_escuela),

    -- Referencia a la tabla de profesores
    FOREIGN KEY (dni_profesor) REFERENCES profesores(dni)
        ON UPDATE CASCADE 
        ON DELETE RESTRICT, 

    -- Referencia a la tabla de escuelas
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela) 
        ON UPDATE CASCADE
        ON DELETE RESTRICT 

);

INSERT INTO profesores_en_escuela (dni_profesor, id_escuela, estado, fecha_creacion, fecha_baja) VALUES
('12345678', 1, 'activo', '2022-08-15', NULL),
('23456789', 2, 'activo', '2023-03-01', NULL),
('34567890', 1, 'activo', '2021-09-20', NULL),
('45678901', 3, 'inactivo', '2020-05-10', '2024-01-30'),
('56789012', 4, 'licencia', '2023-11-05', NULL),
('67890123', 5, 'activo', '2024-01-15', NULL),
('78901234', 2, 'activo', '2022-01-01', NULL),
('89012345', 3, 'inactivo', '2019-07-25', '2023-12-10'),
('90123456', 5, 'activo', '2024-04-01', NULL),
('10111213', 4, 'activo', '2023-09-09', NULL);