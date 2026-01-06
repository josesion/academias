import { Response , Request } from "express";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
import { method as asistenciaServicio } from "../Servicio/asistencia.servicio";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";

/**
 * Controlador HTTP para registrar la asistencia de un alumno.
 *
 * Este endpoint recibe los datos desde el request, los normaliza
 * y delega la lógica de negocio al servicio de asistencia.
 *
 * Responsabilidades:
 * - Parsear y normalizar datos provenientes del `req.body`
 * - Invocar el servicio de asistencia
 * - Traducir los códigos de negocio a códigos HTTP apropiados
 * - Enviar la respuesta HTTP estandarizada
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 * Se esperan los siguientes campos en `req.body`:
 * - id_escuela: number
 * - dni_alumno: number
 * - id_inscripcion: number
 * - estado: string
 * - id_horario_clase: number
 *
 * @param {Response} res
 * Objeto de respuesta HTTP de Express.
 *
 * @returns {Promise<void>}
 * La función no retorna datos directamente, responde mediante `res`.
 *
 * @remarks
 * - Este controlador no contiene validaciones de negocio.
 * - Toda la lógica se delega a `asistenciaServicio`.
 * - Los códigos de error provienen del servicio y se traducen a HTTP.
 *
 * @httpResponses
 * - 200 OK: Asistencia registrada correctamente.
 * - 403 Forbidden: El alumno no posee una inscripción activa.
 * - 409 Conflict: El alumno ya se encuentra en clase o está fuera de la ventana horaria.
 * - 500 Internal Server Error: Error durante la transacción de base de datos.
 *
 * @example
 * POST /asistencias
 * Body:
 * {
 *   "id_escuela": 1,
 *   "dni_alumno": 40567890,
 *   "id_inscripcion": 12,
 *   "estado": "activo",
 *   "id_horario_clase": 8
 * }
 */
const altaAsistencia = async( req : Request , res: Response)=> {
   
    const data = {
        id_escuela : Number( req.body.id_escuela),
        dni_alumno : Number( req.body.dni_alumno),
        id_inscripcion : Number( req.body.id_inscripcion),
        estado  : req.body.estado as string,
        
    };
    const dataAsitencia = {id_horario_clase :  Number(req.body.id_horario_clase),}
    const respuestaAsistencia = await asistenciaServicio.asistencia(data, dataAsitencia);

    switch(respuestaAsistencia.code){
        case 'INSCRIPCION_NO_EXISTE' : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.PROHIBIDO,
                respuestaAsistencia.message,
                respuestaAsistencia.code    
            );    
        };

        case  'ALUMNO_EN_CLASE' : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                respuestaAsistencia.message,
                respuestaAsistencia.code 
            );
        };

        case  "FUERA_DE_VENTANA_HORARIA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                respuestaAsistencia.message,
                respuestaAsistencia.code 
            );
        };

        case  "TRANSACCION_FALLIDA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                respuestaAsistencia.message,
                respuestaAsistencia.code 
            );
        };
        
        case 'ASISTENCIA_OK' :{
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                respuestaAsistencia.message,
                respuestaAsistencia.data,
                undefined ,
                respuestaAsistencia.code
            );
        };

        

        default : {
            enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                "Error interno del servidor"
            )             
        };    
    };

};

export const method = {
    asistencia : tryCatch( altaAsistencia),
} 