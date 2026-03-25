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
    
	    --Niveles base con is_default en 1
		INSERT INTO niveles (nivel, fecha_creacion, estado, is_default, id_escuela) 
		VALUES 
		('Desde cero',   CURDATE(), 'activos', 1, NEW.id_escuela),
		('Principiante', CURDATE(), 'activos', 1, NEW.id_escuela),
		('Intermedio',   CURDATE(), 'activos', 1, NEW.id_escuela),
		('Avanzado',     CURDATE(), 'activos', 1, NEW.id_escuela);    
    
END //
DELIMITER ;


