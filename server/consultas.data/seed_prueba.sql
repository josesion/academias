-- Script de seed para datos de prueba
-- Ejecutar manualmente: mysql -u root -p tu_base_de_datos < seed_prueba.sql

/* 1) ESCUELA INACTIVA para josejefe (rubro baile) */
INSERT INTO escuelas (dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro, baja, rubro)
VALUES (
    20111111,
    'Jose',
    'Admin',
    'Academia Prueba Inactiva',
    'Calle Falsa 123',
    '3871111111',
    CURDATE(),
    'inactivos',
    'baile'
);

SET @id_escuela_inactiva = LAST_INSERT_ID();

/* 2) ESCUELA ACTIVA tipo BAILE para usuario1 */
INSERT INTO escuelas (dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro, baja, rubro)
VALUES (
    20222222,
    'Maria',
    'Baile',
    'Academia Ritmos del Norte',
    'Av. San Martin 456',
    '3872222222',
    CURDATE(),
    'activos',
    'baile'
);

SET @id_escuela_baile = LAST_INSERT_ID();

/* 3) ESCUELA ACTIVA tipo GYM para usuario2 */
INSERT INTO escuelas (dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro, baja, rubro)
VALUES (
    20333333,
    'Carlos',
    'Fitness',
    'Gym Power Fit',
    'Av. Libertador 789',
    '3873333333',
    CURDATE(),
    'activos',
    'gym'
);

SET @id_escuela_gym = LAST_INSERT_ID();

/* 4) USUARIO josejefe - estado inactivo - vinculado a escuela inactiva */
INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela)
VALUES (
    'josejefe',
    '$2b$10$3MRulTuVYlOIRMeTJVqjgOI7dRI3.U8APtqUp5w1L44LDZ2LV3WkO',
    'Jose',
    'Jefe',
    '3871000001',
    'usuario',
    'josejefe@prueba.com',
    'inactivos',
    @id_escuela_inactiva
);

/* 5) USUARIO usuario1 - estado activos - vinculado a escuela baile */
INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela)
VALUES (
    'usuario1',
    '$2b$10$PS0KszOIJmFXWWrWwj8.0.AUhLAGZuW2/FInUT9rST4g05WHXM9QC',
    'Usuario',
    'Baile',
    '3871000002',
    'usuario',
    'usuario1@prueba.com',
    'activos',
    @id_escuela_baile
);

/* 6) USUARIO usuario2 - estado activos - vinculado a escuela gym */
INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela)
VALUES (
    'usuario2',
    '$2b$10$PS0KszOIJmFXWWrWwj8.0.AUhLAGZuW2/FInUT9rST4g05WHXM9QC',
    'Usuario',
    'Gym',
    '3871000003',
    'usuario',
    'usuario2@prueba.com',
    'activos',
    @id_escuela_gym
);
