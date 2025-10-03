import { Response , Request , NextFunction } from "express";
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Función de orden superior que envuelve otra función (generalmente un controlador de ruta asíncrono)
 * para manejar automáticamente los errores y pasarlos al middleware de manejo de errores de Express.
 * @param {Function} fn La función asíncrona (controlador de ruta) a envolver.
 * @returns {Function} Una nueva función (middleware) que ejecuta la función original y maneja los errores.
 */
export const tryCatch = (fn : AsyncRequestHandler ) => {
    return (req : Request, res : Response, next : NextFunction) => {
    try {
        // Ejecuta la función y asegura que el resultado sea una Promesa
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    } catch (error) {
        // Captura cualquier error síncrono que ocurra al ejecutar fn

        next(error);
        
    }
    };
};

