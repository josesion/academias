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

