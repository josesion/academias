-- Sentencia SQL para crear la tabla de 'alumnos'

CREATE TABLE alumnos (
    -- DNI del alumno: numérico y será la clave primaria de la tabla
    dni_alumno BIGINT PRIMARY KEY,

-- Nombre del alumno
nombre VARCHAR(255) NOT NULL,

-- Apellido del alumno
apellido VARCHAR(255) NOT NULL,

-- Correo electrónico del alumno (nullable y SIN UNIQUE: así está en la BD real)
email VARCHAR(255) DEFAULT NULL,

-- Número de celular
numero_celular BIGINT,

-- Estado del alumno: por defecto es 'activos'
estado VARCHAR(50) DEFAULT 'activos' );

-- Sentencia buscar alumno / para verificar si ya existe antes de agregarlo ---
select alumnos.dni_alumno
from alumnos
where
    alumnos.dni_alumno = 33762570;

-- Sentecia para agregar un alumno --
INSERT INTO
    alumnos (
        dni_alumno,
        nombre,
        apellido,
        numero_celular
    )
VALUES (
        45123789,
        'Juan',
        'Pérez',
        3875551234
    );

-- Modificar  datos del alumno --
UPDATE alumnos
SET
    nombre = 'nuevo_nombre',
    apellido = 'nuevo_apellido',
    numero_celular = 1234567890,
    estado = 'inactivos'
WHERE
    dni_alumno = 20111220;