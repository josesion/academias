
import { Response, Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError"; 
import { crearCookie } from "../utils/jwt";
import { CodigoEstadoHTTP } from "../tipados/generico";

import { MAPA_LOGUEO, ERROR_INTERNO_SERVIDOR } from "../respuestas/login";


import { method as loginServicio } from "../Servicio/login.servicios";

/**
 * Controlador de Login: Orquestador de la autenticación de usuarios.
 * * @async
 * @function login
 * @param {Request} req - Petición de Express. Espera body con { usuario, contrasena }.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<Response>} 
 * - 200 (OK): Login exitoso. Setea cookie 'token' y devuelve { id_escuela, id_usuario }.
 * - 404 (NOT_FOUND): El usuario no existe.
 * - 409 (CONFLICT): Contraseña incorrecta.
 * - 500 (INTERNAL_SERVER_ERROR): Errores inesperados.
 * * @description
 * Este controlador actúa como puente entre la petición HTTP y el Servicio de Login.
 * Gestiona la persistencia de la sesión mediante cookies seguras y estandariza 
 * las respuestas del servidor usando `enviarResponse` y `enviarResponseError`.
 */
const login = async( req: Request, res: Response ) =>{

    const loginData = {
        usuario    : req.body.usuario,
        contrasena : req.body.contrasena
    }; 

    const loginResult = await loginServicio.loginServicio( loginData );    

    const config = MAPA_LOGUEO[loginResult.code] || ERROR_INTERNO_SERVIDOR; 

    if ( config.status === CodigoEstadoHTTP.OK){
            const cookieOptions = crearCookie();
            res.cookie("token", loginResult.data?.tokenCadena, cookieOptions);
        return enviarResponse(
                res,
                config.status,
                loginResult.message || config.msg,
                { 
                  id_escuela : loginResult.data?.id_escuela,
                  id_usuario : loginResult.data?.id_usuario,
                  rol        : loginResult.data?.rol ,
                  usuario    : loginResult.data?.usuario    
                },
                undefined,
                loginResult.code
        );  
   }else{
        return enviarResponseError(
                res,
                config.status,
                loginResult.message || config.msg,
                loginResult.code
        );
   };
   
};



export const method ={
    login : tryCatch( login ),
};