

CREATE TABLE cajas (
    id_caja INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    id_usuario INT NULL,
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    
    -- Monto con el que se abre la caja
    monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- NUEVO: Referencia a qué cuenta pertenece el monto_inicial (Efectivo, MP, etc.)
    id_cuenta_apertura INT NULL, 
    
    monto_sistema DECIMAL(10, 2) NULL,
    monto_final_real DECIMAL(10, 2) NULL,
    estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    
    -- Llave foránea a Escuelas
    CONSTRAINT fk_cajas_escuela 
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),
    
    -- Llave foránea a Usuarios
    CONSTRAINT fk_cajas_usuario 
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL,

    -- NUEVA: Llave foránea a Cuentas (para saber dónde está el monto inicial)
    CONSTRAINT fk_cajas_cuenta_apertura 
        FOREIGN KEY (id_cuenta_apertura) 
        REFERENCES cuentas_escuela(id_cuenta)
        ON DELETE SET NULL
);



-- CREATE TABLE cajas (
--     id_caja INT PRIMARY KEY AUTO_INCREMENT,
--     id_escuela INT NOT NULL,
    
--     -- 1. Cambiado de id_usuario a id_usuario_apertura
--     id_usuario_apertura INT NULL, 
    
--     -- 2. Nuevo campo para el cierre
--     id_usuario_cierre INT NULL,
    
--     fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
--     fecha_cierre DATETIME NULL,
    
--     -- Monto con el que se abre la caja
--     monto_inicial DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
--     -- Referencia a qué cuenta pertenece el monto_inicial (Efectivo, MP, etc.)
--     id_cuenta_apertura INT NULL, 
    
--     monto_sistema DECIMAL(10, 2) NULL,
--     monto_final_real DECIMAL(10, 2) NULL,
--     estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
    
--     -- Llave foránea a Escuelas
--     CONSTRAINT fk_cajas_escuela 
--         FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),
    
--     -- Llave foránea a Usuarios (Apertura)
--     CONSTRAINT fk_cajas_usuario_apertura 
--         FOREIGN KEY (id_usuario_apertura) REFERENCES usuarios(id_usuario)
--         ON DELETE SET NULL,

--     -- Llave foránea a Usuarios (Cierre)
--     CONSTRAINT fk_cajas_usuario_cierre 
--         FOREIGN KEY (id_usuario_cierre) REFERENCES usuarios(id_usuario)
--         ON DELETE SET NULL,

--     -- Llave foránea a Cuentas
--     CONSTRAINT fk_cajas_cuenta_apertura 
--         FOREIGN KEY (id_cuenta_apertura) 
--         REFERENCES cuentas_escuela(id_cuenta)
--         ON DELETE SET NULL
-- );


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



