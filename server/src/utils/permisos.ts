import dotenv from 'dotenv';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';
import { enviarResponseError } from './responseError';
import { tryCatch } from './tryCatch';
import { method as validar } from '../data/usuario.data';

dotenv.config(); 

// 1. Extendemos el objeto Request de Express para que acepte req.usuario sin errores de TypeScript
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        rol: string;
        id_escuela: number;
      };
    }
  }
}

// 2. Envolvemos el middleware en tu tryCatch para manejar errores asíncronos de la BD
const validarPermiso = tryCatch(async (req: Request, res: Response, next: NextFunction) => {
    // Obtiene el token de las cookies de la petición.
    const { token } = req.cookies;
    const clave = process.env.JWT_CLAVE;
    
    if (!token) {
        return enviarResponseError(res, 401, "Sin token, no autorizado");
    }

    if (!clave) {
        return enviarResponseError(res, 500, "Clave JWT no configurada en el servidor");
    }

    // 3. Promesificamos o manejamos la verificación del JWT
    jwt.verify(token, clave, async (err: VerifyErrors | null, usuario: JwtPayload | string | undefined) => {
        if (err) {
            return enviarResponseError(res, 403, "Token invalido");
        }

        if (usuario && typeof usuario !== 'string') {
            // usuario.id ahora viene como número desde el payload del login
            const idUsuario = usuario.id; 

            // Validamos contra la BD si el usuario sigue existiendo/está activo
            const id = await validar.buscarIdUsuario(idUsuario);

            if (id.error === false) {
                // 4. ¡LA MAGIA!  todo el payload decodificado en el objeto req
                // Ahora viajan el ID, el ROL y la ESCUELA directo al controlador
                req.usuario = {
                    id: usuario.id,
                    rol: usuario.rol,
                    id_escuela: usuario.id_escuela
                };

                next(); // Pase libre al controlador
            } else {
                return enviarResponseError(res, 400, "ID no aprobada");
            }
        }
    });
});

export { validarPermiso };


export const method = { 
    validarPermiso: tryCatch(validarPermiso)
}