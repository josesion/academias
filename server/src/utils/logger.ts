import winston from 'winston';
import TransporteEventos from './transporteLogs';

/**
 * Logger del server.
 *
 * **Nivel general `info`**: hay tres salidas y cada una decide qué se queda.
 *
 * | Salida                  | Nivel    | Qué guarda                                  |
 * |-------------------------|----------|---------------------------------------------|
 * | `logs/errores.log`      | `error`  | Solo fallos (igual que siempre)             |
 * | Consola                 | `error`  | Solo fallos (la pantalla no cambia)         |
 * | Tabla `logs_eventos`    | `info`   | Todo: peticiones, errores, correos y crons  |
 *
 * Los niveles van **por transporte**, por eso subir el general a `info`
 * no ensucia el archivo ni la consola.
 */
const logger = winston.createLogger({
  level: 'info',
  transports: [
    // 1. ESTO VA AL ARCHIVO (Formato JSON, ideal para guardar)
    new winston.transports.File({ 
      level: 'error',
      filename: 'logs/errores.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // 2. ESTO VA A TU PANTALLA (Formato lindo, con colores)
    new winston.transports.Console({
      level: 'error',
      format: winston.format.combine(
        winston.format.colorize(), // <-- ACÁ ESTÁ LA MAGIA DEL COLOR
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    }),

    // 3. ESTO VA A LA TABLA `logs_eventos` (para la pantalla de administración)
    new TransporteEventos()
  ],
});

export default logger;
