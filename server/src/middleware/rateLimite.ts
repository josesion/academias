import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// A. Limitador Global para toda la API
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // Límite por IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (__req: Request, res: Response, __next: NextFunction, __options: any) => {
        res.status(429).json({
            error: "Demasiadas peticiones desde esta IP, por favor intente más tarde.",
            code: "TOO_MANY_REQUESTS"
        });
    }
});

// B. Limitador Estricto para Login (5 intentos por minuto)
export const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (__req: Request, res: Response, __next: NextFunction, __options: any) => {
        res.status(429).json({
            error: "Demasiados intentos de inicio de sesión. Espera un minuto.",
            code: "AUTH_RATE_LIMIT_EXCEEDED"
        });
    }
});