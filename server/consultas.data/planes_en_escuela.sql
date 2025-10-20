-- EXPLICACIÓN:
-- Esta sentencia CREATE TABLE define la estructura para 'planes_en_escuela'.
-- Esta tabla rompe la relación muchos a muchos entre 'escuelas' y 'planes_pago',
-- permitiendo que cada escuela personalice los planes maestros (heredando la base
-- pero sobrescribiendo valores como el precio o el nombre). La clave primaria 
-- compuesta garantiza que una escuela solo pueda asignar un plan una única vez.
CREATE TABLE planes_en_escuela (
    id_escuela INT NOT NULL,
    id_plan INT NOT NULL,

    -- Campos de control de estado y fechas
    estado VARCHAR(20) DEFAULT 'activos', -- 'activos' o 'inactivo' (para baja lógica)
    fecha_creacion DATE NOT NULL,
    fecha_baja DATE NULL, -- Registra la fecha de inactivación para trazabilidad

    -- herda descripcion del plan global
    nombre_personalizado VARCHAR(255) NULL,

    -- Campos para el detalle de la asignación
    monto_asignado DECIMAL(10, 2) NOT NULL,
    clases_asignadas INT NOT NULL,
    meses_asignados INT NOT NULL,


    -- Definición de Claves
    PRIMARY KEY (id_escuela, id_plan),

    FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON DELETE CASCADE,

    FOREIGN KEY (id_plan)
        REFERENCES planes_pago(id_plan)
        ON DELETE RESTRICT
);


-- EXPLICACIÓN:
-- Estas sentencias INSERT cargan datos de ejemplo en la tabla recién creada.
-- Asignan cuatro planes maestros (IDs 1, 2, 3, 4) a la Escuela 1.
-- El Plan 3 se inserta con estado 'inactivos' para simular un plan que no se ofrece actualmente.
INSERT INTO planes_en_escuela (
    id_escuela,
    id_plan, 
    estado, 
    fecha_creacion,
    nombre_personalizado, 
    monto_asignado,
    clases_asignadas,
    meses_asignados
) 
VALUES
-- 1. Plan Mensual Básico: ACTIVO (Usando el nombre por defecto del plan maestro)
(
    1,                               -- id_escuela
    1,                               -- id_plan (Plan Maestro Básico)
    'activos',                       -- estado
    '2025-10-01',                    -- fecha_creacion
    NULL,                            -- nombre_personalizado (Usar el nombre del Plan 1)
    5000.00,                         -- monto_asignado (Anula el monto maestro si es diferente)
    8,                               -- clases_asignadas
    1                                -- meses_asignados
),

-- 2. Plan Trimestral Avanzado: ACTIVO (Con nombre y precio personalizados para esta escuela)
(
    1,                               -- id_escuela
    2,                               -- id_plan (Plan Maestro Avanzado)
    'activos',                       -- estado
    '2025-09-15',                    -- fecha_creacion
    'Trimestral Plus (Oferta)',      -- nombre_personalizado (Personalizado)
    14000.00,                        -- monto_asignado (Precio de Oferta)
    25,                              -- clases_asignadas
    3                                -- meses_asignados
),

-- 3. Plan Semanal Express: INACTIVO (El plan existe, pero la escuela lo tiene deshabilitado)
(
    1,                               -- id_escuela
    3,                               -- id_plan (Plan Maestro Express)
    'inactivos',                     -- estado (Importante: No se debe mostrar en la lista de venta)
    '2025-10-05',                    -- fecha_creacion
    NULL,                            -- nombre_personalizado
    2000.00,                         -- monto_asignado
    4,                               -- clases_asignadas
    1                                -- meses_asignados (Solo está activo por 1 semana, se usa '1')
),

-- 4. Plan Anual Premium: ACTIVO (Un plan a largo plazo)
(
    1,                               -- id_escuela
    4,                               -- id_plan (Plan Maestro Premium)
    'activos',                       -- estado
    '2025-08-20',                    -- fecha_creacion
    NULL,                            -- nombre_personalizado
    48000.00,                        -- monto_asignado
    100,                             -- clases_asignadas
    12                               -- meses_asignados
);


-- EXPLICACIÓN:
-- Esta sentencia UPDATE simula la modificación de un plan específico (Plan 26)
-- en una escuela específica (Escuela 2). Si esta combinación ya existe, se
-- actualizan todos los campos de personalización (nombre, monto, clases, etc.).
-- Esto es lo que se usaría para editar la oferta de un plan en particular.
UPDATE planes_en_escuela
SET
    nombre_personalizado = "plan modficado ",
    monto_asignado      = 3000,     
    clases_asignadas    = 12,     
    meses_asignados     = 1,      
    estado              = "activos",
    fecha_creacion      = "2025-10-17"     
WHERE
    planes_en_escuela.id_escuela  = 2     
    AND
    planes_en_escuela.id_plan     = 26;   


-- EXPLICACIÓN:
-- Esta sentencia SELECT simula la consulta que realizaría un endpoint para 
-- obtener los planes activos ofrecidos por una escuela específica (Escuela 2),
-- incluyendo la metadata para la paginación (total_registros).
-- Los campos se renombran (alias) para coincidir con la interfaz de datos esperada.
SELECT
    id_plan as id,
    nombre_personalizado as descripcion,
    clases_asignadas as clases,
    meses_asignados as meses ,
    monto_asignado as monto ,
    count(*) over() as total_registros
FROM
    planes_en_escuela
WHERE
    nombre_personalizado LIKE '%'
    AND 
    estado = "activos"
    AND 
        id_escuela = 2
ORDER BY 
    nombre_personalizado ASC,
    id_plan ASC
LIMIT 2
OFFSET 0;