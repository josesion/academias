-- 1. Sesiones de Caja
CREATE TABLE cajas (
    id_caja INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    id_usuario INT NOT NULL, -- El admin que atiende
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- "Fondo de caja"
    monto_final_real DECIMAL(10, 2) NULL, -- Lo que contó el admin al cerrar
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
);


CREATE TABLE movimientos_caja (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_caja INT NOT NULL,
    id_categoria INT NOT NULL, -- Relación con la nueva tabla
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT, -- Este queda como el "anotador" libre para detalles específicos
    referencia_id INT NULL, -- Por si es una inscripción
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
    FOREIGN KEY (id_categoria) REFERENCES categorias_caja(id_categoria)
);