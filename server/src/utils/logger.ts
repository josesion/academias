import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  transports: [
    // 1. ESTO VA AL ARCHIVO (Formato JSON, ideal para guardar)
    new winston.transports.File({ 
      filename: 'logs/errores.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // 2. ESTO VA A TU PANTALLA (Formato lindo, con colores)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // <-- ACÁ ESTÁ LA MAGIA DEL COLOR
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    })
  ],
});

export default logger;