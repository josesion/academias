CREATE TABLE IF NOT EXISTS cuentas_escuela (
    id_cuenta INT AUTO_INCREMENT PRIMARY KEY,
    id_escuela INT NOT NULL,
    nombre_cuenta VARCHAR(50) NOT NULL,
    tipo_cuenta ENUM('fisico', 'virtual') DEFAULT 'virtual',
    -- Ajustado a tu regla de 'activos' / 'inactivos'
    estado ENUM('activos', 'inactivos') DEFAULT 'activos' NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_escuela_en_cuentas 
        FOREIGN KEY (id_escuela) 
        REFERENCES escuelas(id_escuela) 
        ON DELETE CASCADE,

    UNIQUE KEY uq_cuenta_unica_por_escuela (id_escuela, nombre_cuenta)
);

INSERT INTO cuentas_escuela (id_escuela, nombre_cuenta, tipo_cuenta, estado) 
VALUES 
(107, 'Efectivo', 'fisico', 'activos'),
(107, 'Mercado Pago', 'virtual', 'activos');