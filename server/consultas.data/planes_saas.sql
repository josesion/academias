CREATE TABLE planes_saas (
    id_plan INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) DEFAULT 'basico',
    descripcion VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    cant_flyers INT NOT NULL DEFAULT 0,
    caracteristicas JSON NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE suscripciones_escuelas (
    id_suscripcion INT PRIMARY KEY AUTO_INCREMENT,
    id_escuela INT NOT NULL,
    id_plan_saas INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo', -- 'activo', 'suspendido', 'vencido'
    CONSTRAINT fk_suscripcion_escuela FOREIGN KEY (id_escuela) REFERENCES escuelas (id_escuela),
    CONSTRAINT fk_suscripcion_plan FOREIGN KEY (id_plan_saas) REFERENCES planes_saas (id_plan)
);