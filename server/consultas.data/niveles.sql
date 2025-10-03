-- creacion de la tabla niveles --
CREATE TABLE niveles (
    id_niveles INT PRIMARY KEY AUTO_INCREMENT,
    nivel VARCHAR(100),
    baja VARCHAR(20) DEFAULT 'activos'
);

-- inserccion de la tabla --
INSERT INTO niveles (nivel, baja) VALUES
('inicial', 'activos'),
('principiante', 'activos'),
('intermedio', 'activos'),
('avanzado', 'activos');
