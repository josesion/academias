/* ============================================================
   Spec 050 — Transferencias internas y Retenciones en caja
   Migración de estructura (BD local).

   No editar `caja.sql` ni `trigers.sql`: ya están aplicados y
   `migrar.ts` los salta. Este archivo sólo agrega lo nuevo.

   OJO (runner): `migrar.ts` descarta toda sentencia cuyo texto
   empiece con "--". Por eso los comentarios de nivel sentencia
   usan comentarios de bloque.
   ============================================================ */

/* 1. Tabla de vínculo de transferencias entre cuentas. */
CREATE TABLE IF NOT EXISTS transferencias_caja (
    id_transferencia INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    id_caja INT NOT NULL,
    id_cuenta_origen INT NOT NULL,
    id_cuenta_destino INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    id_usuario INT NULL,
    descripcion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transferencia_escuela
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),

    CONSTRAINT fk_transferencia_caja
        FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),

    CONSTRAINT fk_transferencia_cuenta_origen
        FOREIGN KEY (id_cuenta_origen) REFERENCES cuentas_escuela(id_cuenta),

    CONSTRAINT fk_transferencia_cuenta_destino
        FOREIGN KEY (id_cuenta_destino) REFERENCES cuentas_escuela(id_cuenta),

    CONSTRAINT fk_transferencia_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE SET NULL
);

/* 2. Columnas nuevas en detalle_caja (una sentencia por columna:
   el runner ignora el error de columna duplicada y sigue). */
ALTER TABLE detalle_caja
ADD COLUMN id_transferencia INT NULL AFTER referencia_id;

ALTER TABLE detalle_caja
ADD COLUMN estado_retencion ENUM('activa', 'devuelta', 'justificada') NULL AFTER id_transferencia;

ALTER TABLE detalle_caja
ADD COLUMN justificacion_retencion TEXT NULL AFTER estado_retencion;

ALTER TABLE detalle_caja
ADD COLUMN monto_devuelto DECIMAL(10, 2) NULL AFTER justificacion_retencion;

/* 3. Relación de las dos patas de una transferencia con su fila de vínculo. */
ALTER TABLE detalle_caja
ADD CONSTRAINT fk_detalle_transferencia
    FOREIGN KEY (id_transferencia) REFERENCES transferencias_caja(id_transferencia)
    ON DELETE SET NULL;

CREATE INDEX idx_detalle_transferencia ON detalle_caja (id_transferencia);

CREATE INDEX idx_detalle_retencion ON detalle_caja (id_caja, estado_retencion);
