-- creacion de la tabla --

CREATE TABLE inscripcion_alumno (
    id_inscripcion INT PRIMARY KEY AUTO_INCREMENT,
    
    dni_alumno BIGINT NOT NULL,
    FOREIGN KEY (dni_alumno) REFERENCES alumnos(dni_alumno),
    
    id_plan INT NOT NULL,
    FOREIGN KEY (id_plan) REFERENCES planes_pago(id_plan),
    
    monto_pago DECIMAL(10, 2),
    fecha_inicio DATE,
    fecha_fin DATE,
    clases_restantes INT,
    estado VARCHAR(20) DEFAULT 'vigente'
);


-- inserccion de datos ---

INSERT INTO inscripcion_alumno (dni_alumno, id_plan, monto_pago, fecha_inicio, fecha_fin, clases_restantes, estado) VALUES
-- Inscripción 1: Gustavo Ruiz (DNI 40901234) compra el plan 'Pase libre mensual'.
-- Los pases libres no tienen un número fijo de clases, se les asigna 0.
(40901234, 4, 4500.00, '2025-09-04', '2025-10-04', 0, 'vigente'),

-- Inscripción 2: Romina Pérez (DNI 32109876) compra un 'Plan mensual - 8 clases'.
(32109876, 2, 3200.00, '2025-09-04', '2025-10-04', 8, 'vigente'),

-- Inscripción 3: Diego Torres (DNI 35789012) compra un 'Pack de 10 clases'.
(35789012, 6, 4000.00, '2025-09-04', '2025-11-04', 10, 'vigente'),

-- Inscripción 4: Laura Díaz (DNI 28987654) compra una 'Clase suelta'.
(28987654, 1, 500.00, '2025-09-04', '2025-09-04', 1, 'vigente');