-- creacion de la tabla-- 
CREATE TABLE asistencia (
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
    fecha_asistencia DATE DEFAULT (CURRENT_DATE),
    
    -- FK para saber qué alumno asistió
    dni_alumno BIGINT NOT NULL,
    FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno),
    
    -- FK para saber a qué clase de la oferta asistió
    id_oferta INT NOT NULL,
    FOREIGN KEY (id_oferta) REFERENCES oferta_de_clases(id_oferta),
    
    -- Restricción para evitar que un alumno se marque como asistido dos veces a la misma clase
    CONSTRAINT unique_asistencia UNIQUE (dni_alumno, id_oferta, fecha_asistencia)
);


-- inserccion de tuplas --
INSERT INTO asistencia (dni_alumno, id_oferta, fecha_asistencia) VALUES
-- Asistencia 1: Laura Díaz (DNI 28987654) asiste a una clase el 2025-06-20.
(28987654, 1, '2025-06-20'),

-- Asistencia 2: Federico Sánchez (DNI 30567891) asiste a una clase el 2025-06-20.
(30567891, 1, '2025-06-20'),

-- Asistencia 3: Laura Díaz (DNI 28987654) asiste a otra clase el 2025-06-21.
(28987654, 2, '2025-06-21'),

-- Asistencia 4: El mismo Federico Sánchez asiste a una clase diferente el mismo día.
(30567891, 2, '2025-06-21');
