
CREATE TABLE tipo_clase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    fecha_creacion DATE,
    estado VARCHAR(10) NOT NULL DEFAULT 'activos',
    id_escuela INT NOT NULL,
    CONSTRAINT fk_tipo_clase_escuela -- ⬅️ ¡Nombre Único Aquí!
        FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- inserccion de la tabla --
INSERT INTO tipo_clase (tipo, fecha_creacion, estado, id_escuela)
VALUES ('Teórica', CURDATE(), 'activos', 107);