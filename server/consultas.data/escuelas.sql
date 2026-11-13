-- Creacion de la tabla escuelas --
CREATE TABLE escuelas (
    id_escuela INT PRIMARY KEY AUTO_INCREMENT,
    dni_propietario INT,
    nombre_propietario VARCHAR(100),
    apellido_propietario VARCHAR(100),
    razon_social VARCHAR(100),
    direccion VARCHAR(100),
    celular VARCHAR(20),
    urlImagen VARCHAR(255) DEFAULT NULL,
    public_id VARCHAR(255) DEFAULT NULL,
    fecha_registro DATE,
    baja VARCHAR(20) DEFAULT 'activos',
    -- Rubro de la escuela (spec 047): 'baile' | 'gym'.
    -- Define el tema visual y los tipos de clase que siembra el trigger
    -- `despues_de_crear_escuela`. El default mantiene a todas en 'baile'.
    rubro VARCHAR(20) NOT NULL DEFAULT 'baile'
);

INSERT INTO
    escuelas (
        dni_propietario,
        nombre_propietario,
        apellido_propietario,
        razon_social,
        direccion,
        celular,
        urlImagen,
        fecha_registro,
        baja
    )
VALUES (
        35123456,
        'Carlos',
        'Gómez',
        'Academia de Baile Ritmos S.R.L.',
        'Av. Belgrano 450',
        '3874123456',
        'https://tuservidor.com/imagenes/escuelas/ritmos.jpg',
        '2026-09-25',
        'activos'
    );