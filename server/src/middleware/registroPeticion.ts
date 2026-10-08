import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Extrae el camino de la petición **sin la query string**.
 *
 * Se manda solo el path para que en el log no quede lo que viene después
 * del `?` (puede traer DNI u otros datos personales).
 *
 * @function obtenerRuta
 * @param {Request} req - Petición de Express.
 * @returns {string} Ruta como `/api/registro_alumno`, sin parámetros de consulta.
 */
export const obtenerRuta = (req: Request): string => {
    const url = req.originalUrl || req.url || "/";
    return url.split("?")[0];
};

/**
 * Middleware que registra **todas** las peticiones en `logs_eventos`.
 *
 * Se engancha al evento `finish` de la respuesta, cuando ya se conoce el
 * resultado: estado HTTP, duración total y `req.usuario` (que lo completa
 * `permisos.validarPermiso` durante el recorrido de la ruta).
 *
 * Nunca frena ni rompe la petición: solo agrega un listener y dispara el log.
 * **No** se persisten headers, cookies (ahí vive el JWT) ni el body.
 *
 * @function registroPeticion
 * @param {Request} req - Petición de Express.
 * @param {Response} res - Respuesta de Express.
 * @param {NextFunction} next - Siguiente middleware de la cadena.
 * @returns {void}
 */
export const registroPeticion = (req: Request, res: Response, next: NextFunction): void => {

    const inicio = Date.now();

    res.on("finish", () => {
        try {
            const duracion = Date.now() - inicio;
            const ruta = obtenerRuta(req);

            logger.info(`${req.method} ${ruta} → ${res.statusCode} (${duracion} ms)`, {
                origen: "peticion",
                metodo_http: req.method,
                ruta,
                estado_http: res.statusCode,
                duracion_ms: duracion,
                id_escuela: req.usuario?.id_escuela,
                id_usuario: req.usuario?.id
            });
        } catch (error) {
            // Un problema al registrar no debe afectar a la respuesta ya enviada
            console.error("No se pudo registrar la petición:", error);
        }
    });

    next();
};
