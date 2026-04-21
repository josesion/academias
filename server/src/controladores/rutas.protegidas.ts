import { Request , Response } from "express";

import { MAPA_VERIFICACION_SESION , ERROR_INTERNO_SERVIDOR} from "../respuestas/rutas.protegidas";

import { method as verificacionServicio } from "../Servicio/rutas.protegidas.servicios";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
import { CodigoEstadoHTTP } from "../tipados/generico";




/**
 * Controlador para verificar el estado de la sesión del usuario.
 * * Esta función extrae el token de las cookies, delega la validación al servicio
 * de verificación y responde al cliente basándose en un mapa de configuración de estados.
 * * @async
 * @param {Request} req - Objeto de petición de Express. Se espera que contenga las cookies del navegador.
 * @param {Response} res - Objeto de respuesta de Express utilizado para enviar la respuesta final.
 * * @returns {Promise<Response>} Retorna una respuesta HTTP (enviarResponse o enviarResponseError):
 * - 200 (OK): Si la sesión es válida, incluye los datos del usuario en el cuerpo.
 * - 401 (UNAUTHORIZED): Si el token es inválido, expiró o no existe.
 * - 500 (INTERNAL_SERVER_ERROR): Si ocurre un error inesperado en el proceso.
 * * @example
 * // La respuesta exitosa suele contener:
 * // { status: 200, message: "Usuario encontrado", data: { id: "..." }, code: "AUTHORIZED" }
 */

const verificarSesion = async ( req : Request , res : Response ) =>{
    const { token } = req.cookies;
    const verificacionSesion = await  verificacionServicio.verificarSesion( token );
    
    const  config = MAPA_VERIFICACION_SESION[verificacionSesion.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(
            res,
            config.status,
            verificacionSesion.message ||  config.msg,
            verificacionSesion.data,
            undefined,
            verificacionSesion.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            verificacionSesion.message ||  config.msg,
            verificacionSesion.code
        );
    };

};

export const method = { 
   // verificarToken : tryCatch(verificarToken),
    verificarSesion : tryCatch( verificarSesion ),
}