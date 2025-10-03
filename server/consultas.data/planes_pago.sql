
-- creacion de la tapla planes_pagos --

CREATE TABLE planes_pago (
    id_plan INT PRIMARY KEY AUTO_INCREMENT,
    descripcion_plan VARCHAR(255) NOT NULL,
    cantidad_clases INT,
    cantidad_meses INT,
    monto DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activos'
);


-- inserccion de datos a la tabla ---

INSERT INTO planes_pago (descripcion_plan, cantidad_clases, cantidad_meses, monto, estado) VALUES
('Clase de prueba', 1, 0, 500.00, 'activos'),
('Plan mensual - 8 clases', 8, 1, 3200.00, 'activos'),
('Plan trimestral - 24 clases', 24, 3, 9000.00, 'activos'),
('Pase libre mensual', 0, 1, 4500.00, 'activos'),
('Pase libre semestral', 0, 6, 25000.00, 'activos'),
('Paquete de 10 clases', 10, 0, 4000.00, 'activos'),
('Clase para parejas', 1, 0, 800.00, 'activos'),
('Plan anual', 0, 12, 48000.00, 'activos');