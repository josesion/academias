-- Sentencia SQL para crear la tabla de 'alumnos'

CREATE TABLE alumnos (
    -- DNI del alumno: numérico y será la clave primaria de la tabla
    -- Se usa BIGINT para asegurar que el número sea lo suficientemente grande para cualquier DNI
    dni_alumno BIGINT PRIMARY KEY,
    
    -- Nombre del alumno: una cadena de texto
    -- VARCHAR(255) es un tamaño estándar para cadenas de texto cortas o medianas
    nombre VARCHAR(255) NOT NULL,
    
    -- Apellido del alumno: otra cadena de texto, igual que el nombre
    apellido VARCHAR(255) NOT NULL,
    
    -- Número de celular: se usa BIGINT para números grandes.
    -- Se recomienda usar BIGINT o VARCHAR para evitar problemas con los ceros iniciales.
    numero_celular BIGINT,
    
    -- Estado del alumno: por defecto es 'Activo'
    -- Se usa VARCHAR para la cadena de texto que indica el estado
    estado VARCHAR(50) DEFAULT 'activos'
);

-- Sentencia buscar alumno / para verificar si ya existe antes de agregarlo ---
select alumnos.dni_alumno  from alumnos
where  alumnos.dni_alumno = 33762570;


-- Sentecia para agregar un alumno --
INSERT INTO alumnos (dni_alumno, nombre, apellido, numero_celular)
VALUES (45123789, 'Juan', 'Pérez', 3875551234);

-- Modificar  datos del alumno --
UPDATE alumnos
SET 
    nombre = 'nuevo_nombre',
    apellido = 'nuevo_apellido',
    numero_celular = 1234567890,
    estado = 'inactivos'
WHERE dni_alumno = 20111220;