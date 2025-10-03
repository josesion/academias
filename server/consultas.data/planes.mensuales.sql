
-- SQL para crear la tabla de planes mensuales--

CREATE TABLE planes_mensuales_admin (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID único para cada plan, autoincremental
    descripcion VARCHAR(50) NOT NULL,
    limites_cedes INT NOT NULL,
    precio_mensual INT NOT NULL , 
    estado VARCHAR(20) NOT NULL DEFAULT 'activos'-- Columna para registrar cuándo se creó el plan
);
-- Inserción de un plan mensual de ejemplo--

INSERT INTO planes_mensuales_admin (descripcion, limites_cedes, precio_mensual, estado)
VALUES (
    'Plan Básico Mensual',  -- descripcion (VARCHAR(50) NOT NULL)
    5,                      -- limites_cedes (INT NOT NULL)
    12,                     -- cantidad_clases (INT NOT NULL)
    1,                      -- meses (INT NOT NULL)
    1500.00,                -- precio_mensual (DECIMAL(8, 2) NOT NULL, ejemplo: mil quinientos)
    'activo'                -- estado (VARCHAR(20) NOT NULL, DEFAULT 'activo')
);

-- actualizar planes mensuales --

UPDATE planes_mensuales_admin
SET
    descripcion = 'Plan Ilimitado PRO',
    limites_cedes = 20,
    precio_mensual = 120000.00,
    estado = 'inactivo'
WHERE
    id = 1;

-- lista de planes mensuales---

SELECT *
FROM planes_mensuales_admin
WHERE estado = 'activos'  and planes_mensuales_admin.descripcion like "plan%"
ORDER BY descripcion
LIMIT 10 OFFSET 0;

--- coontador de paginas ---- 
select count(*) as total_pagina
from planes_mensuales_admin;