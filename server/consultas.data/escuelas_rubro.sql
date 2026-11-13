/* ============================================================================
   047 - Rubro de escuela (baile | gym)

   1) Columna `escuelas.rubro`
   2) Trigger `despues_de_crear_escuela` con dos ramas de `tipo_clase`
   3) Escuela GYM de demostracion (escuela + suscripcion + usuario)

   ORDEN OBLIGATORIO: la columna antes del trigger (el trigger usa NEW.rubro) y
   la escuela antes del usuario (si no, la FK falla y `migrar` IGNORA el 1452 en
   silencio: la migracion "pasa" pero queda sin usuario).

   Todo va en un solo archivo a proposito: `migrar` aplica los `.sql` en orden
   alfabetico, asi que el seed no puede quedar en un archivo que corra antes.

   OJO (runner): `migrar.ts` descarta toda sentencia cuyo texto empiece con "--".
   Por eso los comentarios de nivel sentencia usan comentarios de bloque.
   ============================================================================ */


/* 1) COLUMNA ================================================================ */

ALTER TABLE escuelas
    ADD COLUMN rubro VARCHAR(20) NOT NULL DEFAULT 'baile'
    COMMENT 'baile | gym'
    AFTER baja;


/* 2) TRIGGER ================================================================
   Todo igual a `trigers.sql` salvo el bloque de `tipo_clase`, que ahora
   depende de `NEW.rubro`. Los valores 'baile' son los mismos 7 de siempre.
   ============================================================================ */

DROP TRIGGER IF EXISTS despues_de_crear_escuela;

DELIMITER //

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


/* 3) ESCUELA GYM DE DEMOSTRACION ============================================
   Depende del trigger -> va despues de recrearlo.
   Los 7 `tipo_clase` NO se insertan aca: los pone el trigger.
   ============================================================================ */

/* 3.1 Escuela (guardada para poder re-ejecutar sin duplicar) */
INSERT INTO escuelas (razon_social, rubro, fecha_registro, baja)
SELECT 'Gym Demo Elphis', 'gym', CURDATE(), 'activos'
WHERE NOT EXISTS (
    SELECT 1 FROM escuelas WHERE razon_social = 'Gym Demo Elphis'
);

SET @id_gym := (
    SELECT id_escuela FROM escuelas
    WHERE razon_social = 'Gym Demo Elphis'
    LIMIT 1
);

/* 3.2 Suscripcion activa (plan basico, 12 meses) */
INSERT INTO suscripciones_escuelas
    (id_escuela, id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado)
SELECT @id_gym, p.id_plan, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 MONTH), 'activo'
FROM planes_saas p
WHERE p.tipo = 'basico'
  AND NOT EXISTS (
      SELECT 1 FROM suscripciones_escuelas s
      WHERE s.id_escuela = @id_gym AND s.estado = 'activo'
  )
LIMIT 1;

/* 3.3 Usuario dueño de la escuela gym.
   Clave de DESARROLLO: gym12345 (hash bcryptjs, no es un secreto real) */
INSERT INTO usuarios
    (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela)
SELECT 'gym_demo',
       '$2b$10$ux5lLPTHQxij1aUzS1yhCegDF32vdF6nObXuVsg0H4rKFuX6PupTS',
       'Gym', 'Demo', NULL, 'usuario', 'gym_demo@demo.local', 'activos', @id_gym
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE usuario = 'gym_demo'
);
