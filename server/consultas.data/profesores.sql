-- crear tablas profesores --
CREATE TABLE profesores (
    dni VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    celular VARCHAR(20),
    baja VARCHAR(20) DEFAULT 'activos'
);


-- insertar datos a tabla --
INSERT INTO profesores (dni, nombre, apellido, celular, baja) VALUES
('25432109', 'Martín', 'Gómez', '3871234567', 'activos'),
('28987654', 'Laura', 'Díaz', '3872345678', 'activos'),
('30567891', 'Federico', 'Sánchez', '3873456789', 'activos'),
('32109876', 'Romina', 'Pérez', '3874567890', 'activos'),
('35789012', 'Diego', 'Torres', '3875678901', 'activos'),
('38345678', 'Silvina', 'Castro', '3876789012', 'activos'),
('40901234', 'Gustavo', 'Ruiz', '3877890123', 'activos'),
('42567890', 'Natalia', 'Vargas', '3878901234', 'activos');

