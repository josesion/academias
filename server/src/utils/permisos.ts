import dotenv from 'dotenv';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Response , Request , NextFunction } from 'express';
import { enviarResponseError } from './responseError';
import { tryCatch } from './tryCatch';
import { method as validar } from '../data/usuario.data';


dotenv.config(); 

const validarPermiso = async(req: Request, res: Response, next: NextFunction) => {
    // Obtiene el token de las cookies de la petición.
    const { token } = req.cookies;
    let idUsuario: string = ""; // Variable para almacenar el ID del usuario extraído del token.

    // Obtiene la clave secreta para verificar el token desde las variables de entorno.
    const clave = process.env.JWT_CLAVE;
    
    // Si no se encuentra el token en las cookies, devuelve un error de no autorizado (401).
    if (!token) {
        return enviarResponseError(res, 401, "Sin token, no autorizado");
    }

    // Si la clave JWT no está configurada en el servidor, devuelve un error interno del servidor (500).
    if (!clave) {
        return enviarResponseError(res, 500, "Clave JWT no configurada en el servidor");
    }

        jwt.verify(token,clave,async (err: VerifyErrors | null, usuario: JwtPayload | string | undefined) => {
            // Si hay un error durante la verificación del token (firma inválida, expirado, etc.),
            // devuelve un error de token inválido (403).
            if (err) {
                return enviarResponseError(res, 403, "Token invalido");
            }

            // Si la verificación del token es exitosa, la variable 'usuario' contendrá la información decodificada del token (el payload).
            // Se verifica si 'usuario' existe y no es una cadena (se espera un objeto JwtPayload).
            if (usuario && typeof usuario !== 'string') {
                // Asigna el ID del usuario extraído del payload del token a la variable 'idUsuario'.
                idUsuario = usuario.id;

                // Llama a la función 'buscarUsuario' del módulo 'validar' para verificar si el usuario existe en la base de datos.
                const id = await validar.buscarIdUsuario(idUsuario);

                // Si la búsqueda del usuario no devuelve un error ('error' es false),
                // significa que el usuario existe y es válido, por lo que se permite el acceso al siguiente middleware o ruta.
                if (id.error === false) {
                    next();
                } else {
                    // Si la búsqueda del usuario devuelve un error ('error' es true),
                    // significa que el ID del usuario del token no está aprobado o no existe,
                    // por lo que se devuelve un error de "ID no aprobada" (400).
                    return enviarResponseError(res, 400, " ID no aprovada");
                }
            }
        }
    );
};   


export const method = { 
    validarPermiso: tryCatch(validarPermiso)
}