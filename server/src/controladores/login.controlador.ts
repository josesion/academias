
import { Response, Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError"; 
import { crearCookie } from "../utils/jwt";
import { CodigoEstadoHTTP } from "../tipados/generico";

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

    switch ( loginResult.code ){
        case 'USUARIO_EXISTE' : 
            const cookieOptions = crearCookie();
            res.cookie("token", loginResult.data?.tokenCadena, cookieOptions);
            return  enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                "Login Exitoso",
                { id_escuela : loginResult.data?.id_escuela, id_usuario : loginResult.data?.id_usuario},
                undefined,
                loginResult.code
            );
        case  "USUARIO_NO_EXISTE" :{
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                loginResult.message,
                loginResult.code
            );
        };  
        
        case  "VERIFICAR_USUARIO" :{
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                loginResult.message,
                loginResult.code
            );
        };         

        default:
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Ocurrió un error inesperado logueo de usuario",
                loginResult.code
            );            
    };
};



export const method ={
    login : tryCatch( login ),
};