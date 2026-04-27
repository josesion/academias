DELIMITER //

DROP TRIGGER IF EXISTS despues_de_crear_escuela //

CREATE TRIGGER despues_de_crear_escuela
AFTER INSERT ON escuelas
FOR EACH ROW
BEGIN
		-- Se ejecuta automáticamente para cada escuela nueva
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado) 
		VALUES (NEW.id_escuela, 'Inscripcion', 'ingreso', 'activos');

		-- Categoría para anular inscripciones (Nueva)
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado) 
		VALUES (NEW.id_escuela, 'Anulacion Inscripcion', 'egreso', 'activos');

		--  Categoría para el Saldo Inicial de apertura
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado) 
		VALUES (NEW.id_escuela, 'Saldo Inicial', 'ingreso', 'activos');
    
	    -- Niveles base con is_default en 1
		INSERT INTO niveles (nivel, fecha_creacion, estado, is_default, id_escuela) 
		VALUES 
		('Desde cero',   CURDATE(), 'activos', 1, NEW.id_escuela),
		('Principiante', CURDATE(), 'activos', 1, NEW.id_escuela),
		('Intermedio',   CURDATE(), 'activos', 1, NEW.id_escuela),
		('Avanzado',     CURDATE(), 'activos', 1, NEW.id_escuela);    

		INSERT INTO cuentas_escuela (id_escuela, nombre_cuenta, tipo_cuenta, estado) 
			VALUES 
			(NEW.id_escuela, 'efectivo', 'fisico', 'activos'),
			(NEW.id_escuela, 'mercado pago', 'virtual', 'activos');		
			
		END //
DELIMITER ;


