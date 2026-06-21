import  { Response , Request } from "express";
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
import { MAPA_ALTA_ASISTENCIA, ERROR_INTERNO_SERVIDOR,
         MAPA_CLASES_ASISTENCIA, MAPA_DATA_ASISTENCIA
 } from "../respuestas/asistencia";


/**
 * Procesa el alta de una asistencia para un alumno en una escuela específica.
 * * La función extrae el `id_escuela` directamente del token del usuario (req.usuario) 
 * y combina los datos del cuerpo de la petición con la lógica de servicio.
 * * @async
 * @function altaAsistencia
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.body: Objeto con { dni_alumno, id_inscripcion, estado, id_horario_clase }.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP estructurada mediante `enviarResponse` o `enviarResponseError`.
 */
const altaAsistencia = async( req : Request , res: Response)=> {
   
    const data = {
        id_escuela : Number( req.usuario?.id_escuela),
        dni_alumno : Number( req.body.dni_alumno),
        id_inscripcion : Number( req.body.id_inscripcion),
        estado  : req.body.estado as string, 
    };

    const dataAsitencia = {id_horario_clase :  Number(req.body.id_horario_clase),}
    const respuestaAsistencia = await asistenciaServicio.asistencia(data, dataAsitencia);


    const config =  MAPA_ALTA_ASISTENCIA[ respuestaAsistencia.code]  || ERROR_INTERNO_SERVIDOR;

    if (config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            respuestaAsistencia.message || config.msg,
            respuestaAsistencia.data,
            undefined,
            respuestaAsistencia.code
        );
    }else{
        return enviarResponseError(
            res,            
            config.status,
            respuestaAsistencia.message || config.msg,
            respuestaAsistencia.code

        );
    };
};

/**
 * Obtiene las fechas y horarios de clases correspondientes a una escuela y estado específicos.
 * * Utiliza el `id_escuela` obtenido desde el token del usuario y el parámetro `estado` 
 * proveniente de la URL para filtrar la consulta.
 * * @async
 * @function fechasHorarios
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.params.estado: El estado de las clases a consultar (ej: 'activa', 'proxima').
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP con la lista de fechas/horarios encontrada 
 * o un error en caso de fallo.
 */
const fechasHorarios = async( req : Request, res : Response) =>{
    const data = {
        id_escuela : Number(req.usuario?.id_escuela),
        estado : req.params.estado as string  
    };

    const fechaClase_actual_proxima = await asistenciaServicio.fechaAsistencia(data);

    const config = MAPA_CLASES_ASISTENCIA[ fechaClase_actual_proxima.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res,
            config.status,
            fechaClase_actual_proxima.message  || config.msg,
            fechaClase_actual_proxima.data,
            undefined,
            fechaClase_actual_proxima.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            fechaClase_actual_proxima.message  || config.msg,
            fechaClase_actual_proxima.code          
        );
    };


};

/**
 * Obtiene el historial o datos específicos de asistencia para un alumno determinado.
 * * Filtra por `id_escuela` (via token), `dni_alumno` y `estado` (via params).
 * * @async
 * @function dataAsistencia
 * @param {Request} req - Objeto de petición de Express. Debe contener:
 * - req.usuario.id_escuela: ID de la escuela extraído del token JWT.
 * - req.params.dni: DNI del alumno a consultar.
 * - req.params.estado: Estado de asistencia a filtrar.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía la respuesta con la información de asistencia o el error correspondiente.
 */
const dataAsistencia = async( req : Request, res : Response) =>{
   
    const data = {
        id_escuela : Number(req.usuario?.id_escuela),
        dni_alumno : Number(req.params.dni),
        estado : req.params.estado as string,
    };

    const dataAsitenciaResult = await asistenciaServicio.dataAsistenciaServicio(data);

    const config = MAPA_DATA_ASISTENCIA[ dataAsitenciaResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return  enviarResponse(
            res,
            config.status ,
            dataAsitenciaResult.message || config.msg,
            dataAsitenciaResult.data,
            undefined,
            dataAsitenciaResult.code 
        );
    }else{
        return  enviarResponseError(
            res,
            config.status ,
            dataAsitenciaResult.message || config.msg,
            dataAsitenciaResult.code         
        );
    };
};

export const method = {
    asistencia : tryCatch( altaAsistencia),
    fechasHorarios : tryCatch( fechasHorarios),
    dataAsistencia : tryCatch( dataAsistencia ),
} 