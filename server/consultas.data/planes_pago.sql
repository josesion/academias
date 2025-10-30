

CREATE TABLE planes_pago (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_plan VARCHAR(255) NOT NULL,
    cantidad_clases INT NOT NULL,
    cantidad_meses INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activos'
);


INSERT INTO planes_pago (descripcion_plan, cantidad_clases, cantidad_meses, monto, estado)
VALUES 
    ('Plan Mensual Básico', 4, 1, 15000.00, 'activos'),
    ('Plan Trimestral Total', 12, 3, 40000.00, 'activos'),
    ('Oferta de Verano', 8, 2, 25000.00, 'inactivos');

