/* ============================================================
   Tabla de tutores / apoderados de alumnos menores de edad.

   Un tutor es la persona responsable de un alumno menor.
   La relación se hace por dni_alumno (FK a alumnos).
   Un alumno puede tener más de un tutor (padre + madre, por ej).

   OJO (runner): `migrar.ts` descarta toda sentencia cuyo texto
   empiece con "--". Por eso los comentarios de nivel sentencia
   usan comentarios de bloque.
   ============================================================ */

CREATE TABLE IF NOT EXISTS tutores (
    id_tutor INT PRIMARY KEY AUTO_INCREMENT,

    /* DNI del tutor (único por persona) */
    dni_tutor BIGINT NOT NULL UNIQUE,

    /* Datos personales del tutor */
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    numero_celular BIGINT,
    email VARCHAR(255) DEFAULT NULL,

    /* Relación con el alumno: padre, madre, abuelo, tutor_legal, etc. */
    relacion_con_alumno VARCHAR(100) NOT NULL,

    /* FK al alumno que representa */
    dni_alumno BIGINT NOT NULL,

    /* Estado del tutor */
    estado VARCHAR(50) DEFAULT 'activos',

    /* Índices y FK */
    INDEX idx_tutores_dni_alumno (dni_alumno),

    CONSTRAINT fk_tutor_alumno
        FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno)
        ON DELETE CASCADE
);
