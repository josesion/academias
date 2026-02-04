-- 1. Sesiones de Caja
CREATE TABLE cajas (
    id_caja INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    id_usuario INT NULL, 
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    monto_sistema DECIMAL(10, 2) NULL, -- <--- El "Monto Esperado" que se guarda al cerrar
    monto_final_real DECIMAL(10, 2) NULL, -- Lo que el admin contó
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
);


CREATE TABLE detalle_caja (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_caja INT NOT NULL,
    id_categoria INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'credito', 'debito') DEFAULT 'efectivo', -- Nuevo campo
    descripcion TEXT,
    referencia_id INT NULL, 
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
    FOREIGN KEY (id_categoria) REFERENCES categorias_caja(id_categoria)
);


INSERT INTO cajas (
    id_escuela, 
    id_usuario, 
    monto_inicial
) VALUES (
    1,      -- El ID de la escuela (desde el contexto)
    null,     -- El ID del profesor/usuario (desde la sesión)
    5000.00 -- El monto con el que inicia el día
);


UPDATE cajas 
SET 
    monto_sistema = ?, 
    monto_final_real = ?, 
    estado = 'cerrada', 
    fecha_cierre = CURRENT_TIMESTAMP
WHERE id_caja = ? AND estado = 'abierta';


INSERT INTO detalle_caja (
    id_caja, 
    id_categoria, 
    monto, 
    metodo_pago, 
    descripcion, 
    referencia_id
) VALUES (
    ?, -- id_caja (la que está abierta actualmente)
    ?, -- id_categoria (ej: 5 para 'Cuotas')
    ?, -- monto (ej: 1500.50)
    ?, -- metodo_pago ('efectivo', 'transferencia', etc.)
    ?, -- descripcion (el "anotador" libre)
    ?  -- referencia_id (null o el ID de una inscripción/venta)
);