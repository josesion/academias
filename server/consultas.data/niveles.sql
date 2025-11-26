CREATE TABLE niveles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(50) NOT NULL,
    fecha_creacion DATE,
    estado VARCHAR(10) NOT NULL DEFAULT 'activos',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    id_escuela INT NOT NULL,
    CONSTRAINT id_escuela FOREIGN KEY (id_escuela) 
        REFERENCES escuelas(id_escuela)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Insercciones obligatorias --
INSERT INTO niveles (nivel, fecha_creacion, estado, is_default, id_escuela)
VALUES
    ('desde cero', CURDATE(), 'activos', TRUE, 107),
    ('principiante', CURDATE(), 'activos', TRUE, 107),
    ('intermedio', CURDATE(), 'activos', TRUE, 107),
    ('avanzado', CURDATE(), 'activos', TRUE, 107);


-- Consulta para obtener el nivel "desde cero" si el parametro existe  --
select id, nivel from niveles
where 
	nivel = "desde cero";


-- Modicar tabla Nivel ---
update 
	niveles
set 
	nivel = "nuevo nivel"
where
	id = 9 and id_escuela = 107;


-- Cambiar el estado de Nivel --
update 
	niveles
set 
	estado = "inactivos"
where
	id = 9 and id_escuela = 107;