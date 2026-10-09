-- Empresas de la plataforma (administrador SaaS).
-- NO es lo mismo que `escuelas`: `escuelas` son las academias que usan el
-- sistema; `empresas` son los clientes de la plataforma, con sus redes sociales
-- y su logo. No lleva `id_escuela` ni `id_usuario` a propósito: son entidades
-- de la plataforma, administradas desde el panel del administrador.

CREATE TABLE empresas (
    id_empresa     INT PRIMARY KEY AUTO_INCREMENT,
    razon_social   VARCHAR(150) NOT NULL,
    domicilio      VARCHAR(255) NOT NULL,

    -- Redes sociales: guardan la DIRECCION de cada red (URL, usuario o numero
    -- con prefijo). Si la empresa no tiene esa red, queda en NULL.
    whatsapp       VARCHAR(255) DEFAULT NULL,
    instagram      VARCHAR(255) DEFAULT NULL,
    facebook       VARCHAR(255) DEFAULT NULL,

    -- Logo en Cloudflare R2: `logo_url` es la URL publica para mostrar en el
    -- front y `public_id` es la key del bucket, que sirve para borrarlo o
    -- reemplazarlo despues (mismo patron que `flyers`).
    logo_url       VARCHAR(500) DEFAULT NULL,
    public_id      VARCHAR(255) DEFAULT NULL,

    -- 'activos' | 'inactivos'. La baja es LOGICA: la fila nunca se borra.
    estado         VARCHAR(20)  NOT NULL DEFAULT 'activos',

    fecha_creacion DATETIME     DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_empresas_estado (estado),
    INDEX idx_empresas_razon  (razon_social)
);