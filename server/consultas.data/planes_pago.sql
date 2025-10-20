-- FILE: planes_en_escuela.sql
-- DESCRIPCIÓN:
-- Esta tabla almacena la relación entre un plan de pago maestro (planes_pago) y una escuela específica (id_escuela).
-- Permite personalizar el nombre, monto y estado del plan a nivel de escuela,
-- o simplemente registrar la asignación con los valores por defecto del plan maestro.
-- Asumimos la existencia previa de la tabla 'escuelas' con un campo 'id_escuela'.

-- Creación de la tabla PLACES_EN_ESCUELA
CREATE TABLE planes_en_escuela (
    id_plan_escuela INT PRIMARY KEY AUTO_INCREMENT,
    
    -- ID de la escuela a la que se le asigna el plan.
    id_escuela INT NOT NULL, 
    
    -- ID del plan maestro de la tabla 'planes_pago'.
    id_plan INT NOT NULL,
    
    -- Nombre o alias del plan tal como lo ve la escuela (puede ser diferente al maestro).
    nombre_personalizado VARCHAR(255) NOT NULL,
    
    -- Los valores numéricos del plan asignado. Se almacenan aquí para permitir la personalización
    -- por escuela, sobrescribiendo los valores del plan maestro si es necesario.
    cantidad_clases INT,
    cantidad_meses INT,
    monto DECIMAL(10, 2) NOT NULL,
    
    -- Estado del plan dentro de esta escuela (activo/inactivo).
    estado VARCHAR(20) DEFAULT 'activo',
    
    fecha_creacion DATE NOT NULL,
    
    -- Restricción de clave foránea que enlaza con la tabla de planes maestros.
    -- ON DELETE CASCADE: Si el plan maestro es eliminado, la asignación de escuela también lo será.
    FOREIGN KEY (id_plan) REFERENCES planes_pago(id_plan),

    -- Restricción de unicidad para evitar que el mismo plan sea asignado dos veces a la misma escuela.
    UNIQUE KEY uk_plan_escuela (id_escuela, id_plan)
);


-- Inserción de datos de ejemplo en PLACES_EN_ESCUELA
-- Nota: Los id_plan usados aquí (1, 2, 3) corresponden a los planes maestros previamente insertados.
-- Se asume que existen las escuelas con id_escuela 1 y 2.

-- Asignación 1: Escuela 1 toma la 'Clase de prueba' (id_plan=1) sin cambios.
INSERT INTO planes_en_escuela (id_escuela, id_plan, nombre_personalizado, cantidad_clases, cantidad_meses, monto, fecha_creacion, estado) VALUES
(1, 1, 'Clase de Prueba Oficial', 1, 0, 500.00, CURDATE(), 'activo');

-- Asignación 2: Escuela 1 toma el 'Plan mensual - 8 clases' (id_plan=2) pero lo vende más caro.
INSERT INTO planes_en_escuela (id_escuela, id_plan, nombre_personalizado, cantidad_clases, cantidad_meses, monto, fecha_creacion, estado) VALUES
(1, 2, 'Mensual Pro - 8 Clases', 8, 1, 3500.00, CURDATE(), 'activo');

-- Asignación 3: Escuela 2 toma el 'Plan trimestral - 24 clases' (id_plan=3) y lo renombra.
INSERT INTO planes_en_escuela (id_escuela, id_plan, nombre_personalizado, cantidad_clases, cantidad_meses, monto, fecha_creacion, estado) VALUES
(2, 3, 'Trimestral Gold', 24, 3, 9000.00, CURDATE(), 'activo');


-- Consulta de verificación (Simula la función 'existenciaPlanEscuela' del controlador)
-- Ejemplo: Verifica si el Plan Maestro ID 2 ya está asignado a la Escuela ID 1.

SELECT 
    id_plan_escuela, 
    nombre_personalizado,
    estado 
FROM 
    planes_en_escuela 
WHERE 
    id_escuela = 1 AND id_plan = 2;
    
-- Ejemplo 2: Verifica si el Plan Maestro ID 4 (que no hemos insertado en esta tabla) ya está asignado a la Escuela ID 1.

SELECT 
    id_plan_escuela, 
    nombre_personalizado,
    estado 
FROM 
    planes_en_escuela 
WHERE 
    id_escuela = 1 AND id_plan = 4;