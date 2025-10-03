-- creacion de la tabla --
CREATE TABLE tipo_clases (
    id_tipo_clases INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(100),
    baja VARCHAR(20) DEFAULT 'activos'
);

-- inserccion de la tabla --
INSERT INTO tipo_clases (descripcion, baja) VALUES
('Salsa', 'activos'),
('Bachata', 'activos'),
('Hip Hop', 'activos'),
('Tango', 'activos'),
('Ballet', 'activos'),
('Reggaeton', 'activos'),
('K-Pop', 'activos'),
('Folklore', 'activos');