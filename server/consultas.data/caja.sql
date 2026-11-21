CREATE TABLE cajas (
    id_caja INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    
    -- IDs para trazabilidad de quién opera la caja
    id_usuario_apertura INT NULL, 
    id_usuario_cierre INT NULL,
    
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    
    -- Montos de cierre
    monto_sistema DECIMAL(10, 2) NULL,      -- Lo que el sistema calcula al cerrar
    monto_final_real DECIMAL(10, 2) NULL,   -- Lo que el usuario dice que hay al cerrar (Neto)
    diferencia_total DECIMAL(10, 2) NULL,   -- Resultado de Real - Sistema
    
    -- Detalle técnico del cierre
    arqueo_detalle JSON NULL,               -- Desglose por cuenta en formato JSON
    observaciones_cierre TEXT NULL,         -- Justificación obligatoria si hay diferencia
    
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
    id_usuario INT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    referencia_id INT NULL,
    -- Columnas de transferencias y retenciones (migración 050)
    id_transferencia INT NULL,
    estado_retencion ENUM('activa','devuelta','justificada') NULL,
    justificacion_retencion TEXT,
    monto_devuelto DECIMAL(10, 2) NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relaciones existentes
    CONSTRAINT fk_detalle_caja_padre
        FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),

    CONSTRAINT fk_detalle_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias_caja(id_categoria),

    CONSTRAINT fk_detalle_cuenta_escuela
        FOREIGN KEY (id_cuenta) REFERENCES cuentas_escuela(id_cuenta),

    -- Relación con usuario
    CONSTRAINT fk_detalle_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL,

    -- Relación con transferencias (migración 050)
    CONSTRAINT fk_detalle_transferencia
        FOREIGN KEY (id_transferencia) REFERENCES transferencias_caja(id_transferencia)
        ON DELETE SET NULL
) ENGINE=InnoDB;



