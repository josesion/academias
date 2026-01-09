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
                respuestaAsistencia.code,
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

/**
 * Controlador HTTP que obtiene la información de horarios de asistencia
 * correspondientes a una escuela:
 * - Clase actualmente en curso.
 * - Próxima clase del día.
 *
 * Este endpoint actúa como capa de exposición del servicio `fechaAsistencia`,
 * transformando los parámetros de la request y devolviendo una respuesta
 * estandarizada al cliente.
 *
 *  Flujo:
 * 1️ Extrae `id_escuela` y `estado` desde los parámetros de la URL.
 * 2️ Invoca el servicio de asistencia para calcular clases en curso y próxima.
 * 3️ Si el resultado es correcto, responde con HTTP 200 y los datos.
 * 4️ Ante cualquier error inesperado, responde con error interno del servidor.
 *
 *  Consideraciones:
 * - El cálculo de fechas depende del reloj del servidor.
 * - No se realiza cacheo de resultados.
 * - Ideal para ser consumido en tiempo real por la pantalla de asistencia.
 *
 * @param req - Request de Express.
 * @param req.params.id_escuela - Identificador de la escuela.
 * @param req.params.estado - Estado de los horarios a evaluar (ej: activo).
 *
 * @param res - Response de Express.
 *
 * @returns Respuesta HTTP estandarizada:
 * - 200 OK con información de clases en curso y próxima.
 * - 500 Error interno si ocurre un fallo inesperado.
 *
 * @example
 * GET /asistencia_fechas/107/activos
 */
const fechasHorarios = async( req : Request, res : Response) =>{
    const data = {
        id_escuela : Number(req.params.id_escuela),
        estado : req.params.estado as string  
    };

    const fechaClase_actual_proxima = await asistenciaServicio.fechaAsistencia(data);

    if ( fechaClase_actual_proxima.code ===  'CURSANDO_PROXIMA_CLASES_OK' ){
        return enviarResponse(
            res, 
            CodigoEstadoHTTP.OK,
            fechaClase_actual_proxima.message,
            fechaClase_actual_proxima.data,
            undefined,
            fechaClase_actual_proxima.code
        );
    };

    return enviarResponseError(
        res,
        CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        "Error en el servidor",
    );
};

export const method = {
    asistencia : tryCatch( altaAsistencia),
    fechasHorarios : tryCatch( fechasHorarios)
} 