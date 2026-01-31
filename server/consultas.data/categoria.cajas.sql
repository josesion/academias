CREATE TABLE categorias_caja (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    nombre_categoria VARCHAR(50) NOT NULL,
    tipo_movimiento ENUM('ingreso', 'egreso') NOT NULL,
    estado ENUM('activos', 'inactivos') DEFAULT 'activos' NOT NULL,
    
    -- UNIQUE KEY actualizada incluyendo el tipo de movimiento
    UNIQUE KEY uq_nombre_escuela_movimiento (id_escuela, nombre_categoria, tipo_movimiento),
    
    CONSTRAINT fk_escuela_categorias 
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela) 
        ON DELETE CASCADE
);

INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento) 
VALUES (1, 'Venta de Uniformes', 'ingreso');


UPDATE categorias_caja 
SET 
    nombre_categoria = 'Nuevo Nombre', 
    tipo_movimiento = 'egreso' 
WHERE id_categoria = 1;


SELECT 
    COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'egreso' THEN det.monto ELSE 0 END), 0) AS total_egresos,
    COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE -det.monto END), 0) AS balance_neto
FROM detalle_caja det
JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
WHERE det.id_caja = 4;