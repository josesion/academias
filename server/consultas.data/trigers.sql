DELIMITER //

DROP TRIGGER IF EXISTS despues_de_crear_escuela //

CREATE TRIGGER despues_de_crear_escuela
AFTER INSERT ON escuelas
FOR EACH ROW
BEGIN
		-- Se ejecuta automáticamente para cada escuela nueva
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado,  categoria_sistema) 
		VALUES (NEW.id_escuela, 'Inscripcion', 'ingreso', 'activos', 1);

		-- Categoría para anular inscripciones (Nueva)
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado,  categoria_sistema) 
		VALUES (NEW.id_escuela, 'Anulacion Inscripcion', 'egreso', 'activos', 1);

		--  Categoría para el Saldo Inicial de apertura
		INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento, estado,  categoria_sistema) 
		VALUES (NEW.id_escuela, 'Saldo Inicial', 'ingreso', 'activos' , 1);
    
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

		-- Tipos de clase segun el rubro de la escuela (spec 047).
		-- 'baile' = los 7 de siempre; 'gym' = los 7 de entrenamiento.
		IF NEW.rubro = 'gym' THEN
			INSERT INTO tipo_clase (tipo, fecha_creacion, estado, id_escuela) 
					VALUES 
					('Sala de pesas', CURDATE(), 'activos', NEW.id_escuela),
					('Funcional',     CURDATE(), 'activos', NEW.id_escuela),
					('Musculación',   CURDATE(), 'activos', NEW.id_escuela),
					('Crossfit',      CURDATE(), 'activos', NEW.id_escuela),
					('Spinning',      CURDATE(), 'activos', NEW.id_escuela),
					('Cardio',        CURDATE(), 'activos', NEW.id_escuela),
					('Stretching',    CURDATE(), 'activos', NEW.id_escuela);
		ELSE
			INSERT INTO tipo_clase (tipo, fecha_creacion, estado, id_escuela) 
					VALUES 
					('Salsa',         CURDATE(), 'activos', NEW.id_escuela),
					('Bachata',       CURDATE(), 'activos', NEW.id_escuela),
					('Ritmos Latinos',CURDATE(), 'activos', NEW.id_escuela),
					('Folklore',      CURDATE(), 'activos', NEW.id_escuela),
					('Tango',         CURDATE(), 'activos', NEW.id_escuela),
					('Urbano',        CURDATE(), 'activos', NEW.id_escuela),
					('Contemporáneo', CURDATE(), 'activos', NEW.id_escuela);
		END IF;

			
		END //
DELIMITER ;


