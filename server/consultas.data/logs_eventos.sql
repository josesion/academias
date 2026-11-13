-- Creacion de la tabla logs_eventos --
-- Registro TÉCNICO de la actividad del server: peticiones HTTP, errores,
-- envíos de correo y ejecución de crons. NO es la auditoría de negocio
-- (esa es la tabla `historial`).
-- Sin FOREIGN KEY: un log tiene que sobrevivir a que se borre la escuela
-- o el usuario, y la purga por fecha no debe chocar con referencias.
-- Sin INSERT de ejemplo a propósito: una fila de mentira aparecería como
-- error real en la pantalla de administración.
CREATE TABLE logs_eventos (

    id_log        BIGINT AUTO_INCREMENT PRIMARY KEY,

    nivel         VARCHAR(10)   NOT NULL,   -- 'error' | 'warn' | 'info'
    origen        VARCHAR(20)   NOT NULL,   -- 'peticion' | 'correo' | 'cron' | 'arranque' | 'servidor'
    mensaje       TEXT          NOT NULL,   -- 1 línea resumen del hecho

    detalle       JSON          NULL,       -- stack, motivo de Resend, destino, asunto, código

    metodo_http   VARCHAR(10)   NULL,
    ruta          VARCHAR(255)  NULL,
    estado_http   SMALLINT      NULL,
    duracion_ms   INT           NULL,

    id_escuela    INT           NULL,
    id_usuario    INT           NULL,
    usuario_nom   VARCHAR(100)  NULL,       -- snapshot del login en el momento del hecho (spec 011:
                                            -- el JWT ya lo trae). Queda NULL en las rutas públicas
                                            -- (login, /api/verificar), en los crons y correos, y en
                                            -- las filas viejas: ahí el listado lo completa con el
                                            -- LEFT JOIN a `usuarios`

    resuelto      TINYINT(1)    NOT NULL DEFAULT 0,   -- 0 = pendiente | 1 = revisado
    fecha         DATETIME      DEFAULT CURRENT_TIMESTAMP

);

-- Orden y purga por fecha
CREATE INDEX idx_logs_fecha
ON logs_eventos(fecha);

-- "solo los errores de los últimos N días"
CREATE INDEX idx_logs_nivel
ON logs_eventos(nivel, fecha);

-- La pantalla arranca mostrando lo pendiente de revisar
CREATE INDEX idx_logs_resuelto
ON logs_eventos(resuelto, fecha);
