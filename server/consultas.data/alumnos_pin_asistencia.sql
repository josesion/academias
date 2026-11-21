-- Sentencia SQL para agregar la columna pin_asistencia a la tabla 'alumnos'
-- Este PIN de 4 dígitos se usa para que el alumno fiche asistencia en el kiosco

-- Agregar columna pin_asistencia (CHAR(4), nullable para alumnos existentes)
ALTER TABLE alumnos ADD COLUMN pin_asistencia CHAR(4) NULL;

-- La validación de unicidad del PIN por escuela se hace en la transacción de alta
-- (la tabla alumnos no tiene id_escuela directamente, usa alumnos_en_escuela).

-- Para generar PINs a alumnos existentes (ejecutar manualmente cuando se necesite):
-- UPDATE alumnos SET pin_asistencia = LPAD(FLOOR(RAND() * 10000), 4, '0') WHERE pin_asistencia IS NULL;
