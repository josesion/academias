
-- Creacion de la tabla usuarios --
CREATE TABLE usuarios (
    usuario VARCHAR(50) PRIMARY KEY,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    celular VARCHAR(20),
    rol VARCHAR(50) NOT NULL DEFAULT 'alumno',
    fecha_alta DATE DEFAULT (CURRENT_DATE),
    correo VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'activos',
    -- Campo para la clave foránea
    id_escuela INT,
    -- Definición de la clave foránea
    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
);



-- Insercion de un usuario de ejemplo --
INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado)
VALUES (
    'juan_perez',                                  -- usuario (VARCHAR(50) PRIMARY KEY)
    '$2a$10$abcdefghijklmnopqrstuvwxyz0123456789', -- contrasena (VARCHAR(255) NOT NULL, hasheada)
    'Juan',                                        -- nombre (VARCHAR(100) NOT NULL)
    'Perez',                                       -- apellido (VARCHAR(100) NOT NULL)
    '3871234567',                                  -- celular (VARCHAR(20), opcional, pero incluido)
    'alumno',                                      -- rol (VARCHAR(50) NOT NULL, DEFAULT 'alumno')
    'juan.perez@example.com',                      -- correo (VARCHAR(255) UNIQUE NOT NULL)
    'activos'                                       -- estado (VARCHAR(20) NOT NULL, DEFAULT 'activo')
);



-- Consulta SQL para actualizar los datos personales de un usuario.
-- NOTA: Se usan marcadores de posición (?) para pasar los valores de manera segura.
UPDATE usuarios
SET
    nombre = ?,          -- Placeholder para el nombre del usuario
    apellido = ?,        -- Placeholder para el apellido del usuario
    celular = ?,         -- Placeholder para el número de celular
    correo = ?           -- Placeholder para la dirección de correo electrónico
WHERE
    usuario = ?;

-- Consulta SQL para actualizar solo el rol y el estado de un usuario.
-- Los '?' son marcadores de posición para valores seguros.
UPDATE usuarios
SET
    rol = ?,           -- Placeholder para el nuevo rol del usuario
    estado = ?         -- Placeholder para el nuevo estado del usuario
WHERE
    usuario = ?;       -- Placeholder para la clave primaria (nombre de usuario)

-- MOD pára cambiar la contraseña--
UPDATE usuarios
SET
    contrasena = ?   -- Placeholder para la nueva contraseña (ya hasheada)
WHERE
    usuario = ?;     -- Placeholder para el nombre de usuario

-- Buscar un usuario por su nombre de usuario --
SELECT * FROM usuarios WHERE usuario = 'juan_perez';


-- listado parametrizado 
SELECT * FROM usuarios
WHERE
    usuario LIKE ? AND
    nombre LIKE ? AND
    apellido LIKE ? AND
    rol = ? AND
    correo LIKE ? AND
    estado = ?
ORDER BY
    usuario
LIMIT 10 OFFSET 10;


--- contador  del listado --
SELECT count(*) as totalUsuario FROM usuarios
WHERE
    usuario LIKE "%" AND
    nombre LIKE "%" AND
    apellido LIKE "%" AND
    rol = "usuario" AND
    correo LIKE "%" AND
    estado = "activos";