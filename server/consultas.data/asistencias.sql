CREATE TABLE asistencias (
    -- Identificador único del evento de asistencia
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,

    -- Contexto institucional
    id_escuela INT NOT NULL,

    -- Alumno que asiste
    dni_alumno BIGINT NOT NULL,

    -- Inscripción bajo la cual se consume la clase
    id_inscripcion INT NOT NULL,

    -- Horario/clase específica
    id_horario_clase INT NOT NULL,

    -- Fecha real en que se toma la clase
    fecha DATE NOT NULL,

    -- Estado de la asistencia
    estado ENUM('presente', 'ausente', 'justificado') DEFAULT 'presente',

    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- ----------------------------------------------------
    -- CLAVES FORÁNEAS
    -- ----------------------------------------------------

    -- Escuela
    CONSTRAINT fk_asistencia_escuela
        FOREIGN KEY (id_escuela)
        REFERENCES escuelas(id_escuela)
        ON DELETE RESTRICT,

    -- Alumno
    CONSTRAINT fk_asistencia_alumno
        FOREIGN KEY (dni_alumno)
        REFERENCES alumnos(dni_alumno)
        ON DELETE RESTRICT,

    -- Alumno pertenece a la escuela
    CONSTRAINT fk_asistencia_alumno_escuela
        FOREIGN KEY (dni_alumno, id_escuela)
        REFERENCES alumnos_en_escuela(dni_alumno, id_escuela)
        ON DELETE RESTRICT,

    -- Inscripción (consume clases)
    CONSTRAINT fk_asistencia_inscripcion
        FOREIGN KEY (id_inscripcion)
        REFERENCES inscripciones(id_inscripcion)
        ON DELETE CASCADE,

    -- Horario de clase
    CONSTRAINT fk_asistencia_horario
        FOREIGN KEY (id_horario_clase)
        REFERENCES horarios_clases(id)
        ON DELETE RESTRICT,

    -- ----------------------------------------------------
    -- REGLA DE NEGOCIO
    -- ----------------------------------------------------

    -- Un alumno no puede tomar la misma clase dos veces el mismo día
    UNIQUE (id_inscripcion, id_horario_clase, fecha),
    
	-- ----------------------------------------------------
    -- ÍNDICES PARA PERFORMANCE
    -- ----------------------------------------------------

    -- Consultas frecuentes por inscripción y estado
    INDEX idx_asistencia_inscripcion_estado (id_inscripcion, estado),

    -- Listados diarios por escuela
    INDEX idx_asistencia_escuela_fecha (id_escuela, fecha)
);
-- Marcar la asietncia  --

INSERT INTO asistencias (
    id_escuela,
    dni_alumno,
    id_inscripcion,
    id_horario_clase,
    fecha,
    estado
)
VALUES (
    ?, ?, ?, ?, CURDATE(), 'presente'
);
-- actualizar el estado a vencido--
UPDATE inscripciones 
         SET estado = 'vencidos'
         WHERE id_inscripcion = ?


--Sentencia para colorcar vencidos a los estados q ya pasaron la fecha de su vencimiento ---

UPDATE inscripciones
SET estado = 'vencidos'
WHERE id_inscripcion > 0
  AND estado = 'activos'
  AND fecha_fin < CURDATE();


-- Para ver si todavia tiene una inscripcion vigente --        

SELECT 1
FROM inscripciones
WHERE id_inscripcion = 25
  AND dni_alumno = 40567890
  AND id_escuela = 107
  AND estado = 'activos'
LIMIT 1;

-- VErifiucar si ya asistio 
SELECT 1
FROM asistencias
WHERE id_inscripcion = 23
  AND id_horario_clase = 14
  AND fecha = CURDATE()
LIMIT 1;


-- cuantas clases le quedan
SELECT COUNT(*)
FROM asistencias
WHERE id_inscripcion = ?
AND estado = 'presente';

-- Para saber cuantas clases le quedan
SELECT
  i.id_inscripcion,
  (i.clases_asignadas_inscritas * i.meses_asignados_inscritos)
    - COUNT(a.id_asistencia) AS clases_restantes
FROM inscripciones i
LEFT JOIN asistencias a
  ON a.id_inscripcion = i.id_inscripcion
 AND a.estado = 'presente'
WHERE i.id_inscripcion = ?
GROUP BY i.id_inscripcion;


-- Sentencia para calcular y pasar a vencido la inscripcion  al colocar una asitencia --

  UPDATE inscripciones i
SET i.estado = 'vencidos'
WHERE i.id_inscripcion = 26
  AND i.estado = 'activos'
  AND (
      (i.clases_asignadas_inscritas * i.meses_asignados_inscritos)
      -
      (
          SELECT COUNT(*)
          FROM asistencias a
          WHERE a.id_inscripcion = i.id_inscripcion
            AND a.estado = 'presente'
      )
  ) <= 0;

-- para verificar la ventana para marcar la asistencia --
SELECT 1
FROM horarios_clases
WHERE id = 47
AND NOW() BETWEEN
  DATE_SUB(
    TIMESTAMP(CURDATE(), CAST(hora_inicio AS TIME)),
    INTERVAL 15 MINUTE
  )
  AND
  DATE_ADD(
    TIMESTAMP(CURDATE(), CAST(hora_inicio AS TIME)),
    INTERVAL 30 MINUTE
  )
LIMIT 1;


--- Consulta para ver la clase q esta en curso ----
select id as id_horario_en_clase, hora_inicio, hora_fin from horarios_clases
where
	id_escuela = 107 and estado = "activos" and vigente = 1
	and now() between CAST( hora_inicio as time) and  CAST( hora_fin as time);


--- consulta para ver la proxima clase ------
SELECT id as id_horario_prox_clase, hora_inicio, hora_fin FROM horarios_clases
WHERE 
    id_escuela = 107 
    AND estado = 'activos' 
    AND vigente = 1
    -- Filtramos las clases que empiezan después de ahora
    AND CAST(hora_inicio AS TIME) > CAST(NOW() AS TIME)
ORDER BY 
    CAST(hora_inicio AS TIME) ASC
LIMIT 1; 