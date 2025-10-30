-- Creacion de la tabla escuelas --
CREATE TABLE escuelas (
    id_escuela INT PRIMARY KEY AUTO_INCREMENT,
    dni_propietario int,
    nombre_propietario VARCHAR(100),
    apellido_propietario VARCHAR(100),
    razon_social VARCHAR(100),
    direccion VARCHAR(100),
    celular VARCHAR(20),
    fecha_registro DATE,
    baja VARCHAR(20) DEFAULT 'activos'
);


INSERT INTO escuelas (dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro, baja)
VALUES (
    45678901, 
    'María', 
    'López', 
    'Academia Danza Latina S.R.L.', 
    'Av. Central 500', 
    '3874556677', 
    '2025-10-28', 
    'activos'
);