import { Request, Response, NextFunction } from 'express';
import { enviarResponseError } from './responseError'; // Asegurate de importar esto si lo usás
import { tryCatch } from './tryCatch';

// Definimos el tipo para los planes permitidos (puede ser un string o un array de strings)
type PlanesPermitidos = string | string[];

export const verificarPlan = (planesPermitidos: PlanesPermitidos) => {
    return tryCatch(async (req: Request, res: Response, next: NextFunction) => {
        // Obtenemos el plan actual del usuario (cargado previamente por el middleware de autenticación)
        const planActual = req.usuario?.tipo; // O req.usuario?.tipo_plan según cómo lo tengas en el token

        if (!planActual) {
            return enviarResponseError(res, 403, "No se encontró información del plan en la sesión.");
        }

        // Convertimos siempre a array para unificar la validación de forma limpia
        const permitidos = Array.isArray(planesPermitidos) ? planesPermitidos : [planesPermitidos];

        // Si el plan del usuario no está en la lista de permitidos, lo frenamos
        if (!permitidos.includes(planActual)) {
            return enviarResponseError(res, 403, `Acceso restringido. Este endpoint requiere el plan: ${permitidos.join(' o ')}.`);
        }

        // Pase libre al controlador
        next();
    });
};

export const method = {
    verificarPlan
};