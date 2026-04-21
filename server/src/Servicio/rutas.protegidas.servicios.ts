

import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { method as dataUsuario } from "../data/usuario.data";
import { TipadoData } from "../tipados/tipado.data";
import { tryCatchDatos } from '../utils/tryCatchBD';

dotenv.config();

/**
 * Valida la autenticidad de un token JWT y verifica la existencia del usuario en la base de datos.
 * * @async
 * @param {string} token - El token JWT obtenido de las cookies de la petición.
 * @returns {Promise<TipadoData<{id: string}>>} Objeto de tipo TipadoData que contiene:
 * - error: boolean (true si falló la validación o el usuario no existe).
 * - message: string (descripción del resultado).
 * - data: {id: string} (solo si el usuario fue autorizado con éxito).
 * - code: string (código de estado interno: 'AUTHORIZED', 'UNAUTHORIZED', o 'ERROR_SERVIDOR_USUARIO').
 * * @throws {Error} Si el token es inválido o expiró, el error es capturado por el middleware tryCatchDatos.
 */

const verificarSesion = async (token: string): Promise<TipadoData<{id : string}>> => {
    const clave = process.env.JWT_CLAVE;

    if (!token || !clave) {
        return { error: true, message: "No autorizado", code: "UNAUTHORIZED" };
    }

    const usuario = jwt.verify(token, clave) as JwtPayload;

    if (usuario && typeof usuario !== 'string') {
        const idUsuario = usuario.id;
        const id = await dataUsuario.buscarIdUsuario(idUsuario);

        if (id.error === false) {
            return {
                error: false,
                message: "Usuario encontrado",
                data: usuario.id,
                code: "AUTHORIZED"
            };
        }
    };

    return {
        error: true,
        message: "Error al autorizar el usuario",
        code: "ERROR_SERVIDOR_USUARIO"
    };
};

export const method = { 
    verificarSesion : tryCatchDatos( verificarSesion ),
};
