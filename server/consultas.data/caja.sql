

CREATE TABLE cajas (
    id_caja INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    
    -- IDs para trazabilidad de quién opera la caja
    id_usuario_apertura INT NULL, 
    id_usuario_cierre INT NULL,
    
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    
    -- El monto inicial ya no va aquí, se registra en detalle_caja
    
    monto_sistema DECIMAL(10, 2) NULL,      -- Lo que el sistema calcula al cerrar
    monto_final_real DECIMAL(10, 2) NULL,   -- Lo que el usuario dice que hay al cerrar
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    
    -- Llave foránea a Escuelas
    CONSTRAINT fk_cajas_escuela 
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),
    
    -- Llave foránea a Usuarios (Apertura)
    CONSTRAINT fk_cajas_usuario_apertura 
        FOREIGN KEY (id_usuario_apertura) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL,

    -- Llave foránea a Usuarios (Cierre)
    CONSTRAINT fk_cajas_usuario_cierre 
        FOREIGN KEY (id_usuario_cierre) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);



DROP TABLE IF EXISTS detalle_caja;

CREATE TABLE detalle_caja (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_caja INT NOT NULL,
    id_categoria INT NOT NULL,
    id_cuenta INT NOT NULL, 
    id_usuario INT NULL, -- <--- Nuevo campo agregado
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    referencia_id INT NULL, 
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones existentes
    CONSTRAINT fk_detalle_caja_padre 
        FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
        
    CONSTRAINT fk_detalle_categoria 
        FOREIGN KEY (id_categoria) REFERENCES categorias_caja(id_categoria),
        
    CONSTRAINT fk_detalle_cuenta_escuela 
        FOREIGN KEY (id_cuenta) REFERENCES cuentas_escuela(id_cuenta),

    -- Nueva relación agregada
    CONSTRAINT fk_detalle_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL -- Si el usuario se borra, el movimiento persiste por auditoría
) ENGINE=InnoDB;



