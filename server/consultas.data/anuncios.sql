-- Anuncios de la plataforma: un video o una imagen con un texto y una forma de
-- contacto. Los publica el administrador (todas las rutas de anuncios son
-- `soloAdministrador`).
--
-- No lleva `id_escuela` ni `id_usuario`: un anuncio es de la plataforma, no de
-- una academia. Lo que si tiene es `id_empresa`, porque el listado se filtra por
-- la razon social de la empresa dueña del anuncio.

CREATE TABLE anuncios (
    id_anuncio        INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa        INT NOT NULL,

    titulo            VARCHAR(150)  NOT NULL,
    descripcion       VARCHAR(1000) NOT NULL,

    -- Como se muestra el aviso en el frontend: 'whatsapp' | 'facebook' |
    -- 'instagram'. NO es la direccion: esa vive en la columna correspondiente de
    -- `empresas` (y si esta en NULL, el frontend no muestra ese boton).
    tipo_contacto     ENUM('whatsapp','facebook','instagram') NOT NULL,

    -- 'imagen' | 'video'. Lo deducimos del mimetype del archivo, no lo manda
    -- el cliente.
    tipo_media        ENUM('imagen','video') NOT NULL,

    -- Media en Cloudflare R2: `media_url` es la URL publica y `public_id` la key
    -- del bucket, para poder reemplazarla o borrarla despues.
    media_url         VARCHAR(500)  NOT NULL,
    public_id         VARCHAR(255)  NOT NULL,

    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_anuncio_empresa FOREIGN KEY (id_empresa) REFERENCES empresas (id_empresa),

    -- Cubre el listado por empresa y el orden por fecha.
    INDEX idx_anuncios_empresa_fecha (id_empresa, fecha_creacion)
);