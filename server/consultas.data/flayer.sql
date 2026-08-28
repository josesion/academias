CREATE TABLE flyers (
    id_flayer INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    titulo VARCHAR(150),
    descripcion VARCHAR(500),
    imagen_url VARCHAR(500) NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_flayer_escuela FOREIGN KEY (id_escuela) REFERENCES escuelas (id_escuela)
);

INSERT INTO
    flyers (
        id_escuela,
        titulo,
        descripcion,
        imagen_url,
        public_id,
        fecha_creacion,
        fecha_actualizacion
    )
VALUES (
        1,
        'Promoción de Agosto',
        'Inscripciones abiertas para clases de danza.',
        'https://res.cloudinary.com/m9nbjcnx/image/upload/v1787784596/academias/flyers/onharm2pflnscu7okbtk.jpg',
        'academias/flyers/onharm2pflnscu7okbtk',
        CURRENT_TIMESTAMP,
        NULL
    );

DELETE FROM flyers WHERE id_flayer = 2;