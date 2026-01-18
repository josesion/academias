CREATE TABLE categorias_caja (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL,
    tipo_movimiento ENUM('ingreso', 'egreso') NOT NULL,
    estado ENUM('activos', 'inactivos') DEFAULT 'activos' NOT NULL
);


INSERT INTO categorias_caja (nombre_categoria, tipo_movimiento, estado) VALUES 
('Seminarios Especiales', 'ingreso', 'activo'),
('Venta de Bebidas', 'ingreso', 'activo'),
('Reparaciones Técnicas', 'egreso', 'activo'),
('Publicidad Redes Sociales', 'egreso', 'activo'),
('Categoría de Prueba Vieja', 'egreso', 'inactivo');