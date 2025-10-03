-- creacion de la tabla con sus resticciones --
CREATE TABLE oferta_de_clases (
    id_oferta INT PRIMARY KEY AUTO_INCREMENT,
    fecha_clase DATE,
    horario TIME,
    dia_clase VARCHAR(20),
    monto_clase DECIMAL(10, 2),
    estado VARCHAR(20) DEFAULT 'disponible',
    
    id_tipo_clases INT NOT NULL,
    id_niveles INT NOT NULL,
    dni_profesor VARCHAR(20) NOT NULL,
    id_escuela INT NOT NULL,
    
    FOREIGN KEY (id_tipo_clases) REFERENCES tipo_clases(id_tipo_clases),
    FOREIGN KEY (id_niveles) REFERENCES niveles(id_niveles),
    FOREIGN KEY (dni_profesor) REFERENCES profesores(dni),
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),
    
    -- Restricción para la escuela: no puede haber dos clases al mismo tiempo en la misma escuela
    CONSTRAINT unique_escuela_horario UNIQUE (id_escuela, dia_clase, horario),
    
    -- Restricción para el profesor: no puede estar programado para dos clases al mismo tiempo
    CONSTRAINT unique_profesor_horario UNIQUE (dni_profesor, dia_clase, horario)
);


--- inserccion de las tablas   ----
-- Inserción 1: Clase de Salsa en la escuela 1 con el profesor 25432109
INSERT INTO oferta_de_clases (fecha_clase, horario, dia_clase, monto_clase, id_tipo_clases, id_niveles, dni_profesor, id_escuela)
VALUES ('2024-06-20', '18:00:00', 'Martes', 500.00, 1, 2, '25432109', 1);

-- Inserción 2: Clase de Bachata en la misma escuela, pero con otro profesor en un horario diferente
INSERT INTO oferta_de_clases (fecha_clase, horario, dia_clase, monto_clase, id_tipo_clases, id_niveles, dni_profesor, id_escuela)
VALUES ('2024-06-21', '19:30:00', 'Miércoles', 550.00, 2, 3, '28987654', 1);

--- inserccion fallida como ejemplo --
-- esta fallara por q el profesro '25432109' ya esta dando clases  el martes a las 18_00_00
INSERT INTO oferta_de_clases (fecha_clase, horario, dia_clase, monto_clase, id_tipo_clases, id_niveles, dni_profesor, id_escuela)
VALUES ('2024-06-20', '18:00:00', 'Martes', 600.00, 3, 4, '25432109', 1);
