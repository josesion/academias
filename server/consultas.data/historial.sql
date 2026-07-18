CREATE TABLE historial (

    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,

    id_escuela INT NOT NULL,

    id_usuario INT NOT NULL,

    modulo VARCHAR(50) NOT NULL,

    accion VARCHAR(30) NOT NULL,

    id_registro BIGINT NULL,

    descripcion VARCHAR(300) NOT NULL,

    datos JSON NULL,

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela),

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)

);
CREATE INDEX idx_historial_fecha
ON historial(fecha);

INSERT INTO historial
(id_escuela, id_usuario, modulo, accion, id_registro, descripcion, datos)
VALUES

(1, 1, 'ALUMNOS', 'CREAR', 101,
'Se creó el alumno Juan Pérez.',
JSON_OBJECT(
    'nombre', 'Juan',
    'apellido', 'Pérez'
)),

(1, 2, 'PLANES', 'MODIFICAR', 3,
'Se modificó el valor del Plan Mensual.',
JSON_OBJECT(
    'monto_anterior', 18000,
    'monto_nuevo', 22000
)),

(1, 2, 'CAJA', 'CIERRE', 8,
'Se realizó el cierre de caja.',
JSON_OBJECT(
    'saldo_final', 127000
));