import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionServicios } from "../Servicio/inscripciones.servicios";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * Controlador para gestionar la inscripción de un alumno.
 * 
 * Valida la inscripción recibida desde el cliente, llama al servicio
 * correspondiente para verificar si ya existe, crearla o retornar un error
 * de negocio, y luego envía la respuesta HTTP adecuada al cliente.
 * 
 * @param {Request} req - Objeto de solicitud Express. Se espera que en `req.body` 
 *                        venga la información de la inscripción.
 * @param {Response} res - Objeto de respuesta Express para enviar el resultado.
 * 
 * @returns {Promise<Response>} - Retorna una respuesta HTTP usando `enviarResponse` 
 *                                o `enviarResponseError`, dependiendo del resultado
 *                                de la operación de inscripción.
 * 
 * @example
 * // Ejemplo de uso en rutas Express
 * router.post('/inscripcion', inscripcion);
 */

const inscripcion = async( req : Request , res : Response ) =>{

 const dataInscripcion = await inscripcionServicios.inscripcionServicios(req.body);
switch(dataInscripcion.code){
    // Casos en el cual devueve un error de negocio
    case "INSCRIPCION_EXISTENTE" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                dataInscripcion.message,
                dataInscripcion.code
            );
        };

    case "INSCRIPCION_CREACION_FALLIDA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
                "Ocurrió un error inesperado en el alta del horario",
                dataInscripcion.code
            );
    };

    case "NO_SE_LOGRO_VERIFICAR" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
                "Ocurrió un error inesperado al verificar el horario",
                dataInscripcion.code
            );        
    };

    // Casos en lo que va todo bien
 
    case "INSCRIPCION_EXITOSA" : {
        return enviarResponse(
            res, 
            CodigoEstadoHTTP.OK,
            dataInscripcion.message,
            dataInscripcion.data,
            undefined,
            dataInscripcion.code
        );
    };
    
    default : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Ocurrió un error inesperado en la inscripcion",
                dataInscripcion.code
            );
    }
};
    
};


export const method = {
    inscripcion    : tryCatch( inscripcion )
}
