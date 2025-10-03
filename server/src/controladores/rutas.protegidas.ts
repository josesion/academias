import { Request , Response } from "express";
import dotenv from 'dotenv';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

import { method as dataUsuario } from "../data/usuario.data";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";


dotenv.config();

/**
 * @function verificarToken
 * @description Controlador de Express para verificar la validez de un token JWT presente en las cookies de la solicitud.
 * Si el token es válido y corresponde a un usuario existente en la base de datos,
 * la solicitud se considera autorizada y se devuelve el nombre de usuario.
 *
 * @param {Request} req - Objeto de la petición de Express.
 * Espera un token JWT en `req.cookies.token`.
 * Se asume que la clave secreta JWT está configurada en `process.env.JWT_CLAVE`.
 * @param {Response} res - Objeto de la respuesta de Express utilizado para enviar las respuestas HTTP.
 * @returns {Promise<void>} Esta función no devuelve un valor, sino que finaliza la petición
 * enviando una respuesta JSON al cliente (éxito o error).
 *
 * @example
 * // Uso típico en tus rutas de Express (ej. en 'rutas/login.ts'):
 * // rutas.get("/api/verificar", controladorLogin.verificarToken);
 */

const verificarToken = async( req : Request , res : Response) =>{
    const { token } = req.cookies; // Obtiene el token de las cookies de la petición.
    const clave = process.env.JWT_CLAVE; // Obtiene la clave secreta para verificar el token desde las variables de entorno.
    let idUsuario : string = "";
    if (!token || !clave) return enviarResponseError(res, 401, "No autorizado", "UNAUTHORIZED");

    jwt.verify(token, clave ,async (err: VerifyErrors | null, usuario: JwtPayload | string | undefined) => {
        if (err) {
            return enviarResponseError(res, 401, "Token inválido", "UNAUTHORIZED");
        }
        if (usuario && typeof usuario !== 'string') {
            idUsuario = usuario.id; 
            const id = await dataUsuario.buscarIdUsuario(idUsuario);
            if (id.error === false ) return enviarResponse(res, 200 , "Usuario encontrado", usuario.id ,undefined ,"AUTHORIZED" );
        }else { 
            return enviarResponseError(res, 401, "Token inválido", "UNAUTHORIZED");
        }
    });
}   

export const method = { 
    verificarToken : tryCatch(verificarToken)
}