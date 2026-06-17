import { Request , Response } from "express";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a serbivios para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────

import { method as servicioTipo}  from "../Servicio/tipo.clase.servicio";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch"; 
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response"; 
import { fechaHoy } from "../hooks/fecha";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { MAPA_ALTA_TIPO_CLASE, ERROR_INTERNO_SERVIDOR, MAPA_MOD_TIPO_CLASE,
         MAPA_ESTADO_TIPO_CLASE, MAPA_LISTADO_TIPO_CLASE
 } from "../respuestas/tipo.clase";        
import { CodigoEstadoHTTP } from "../tipados/generico";



/**
 * Controlador para el alta de un nuevo tipo de clase.
 * * Extrae el nombre del tipo desde el cuerpo de la petición, le asigna la 
 * fecha actual y la escuela del usuario autenticado, y delega la lógica 
 * al servicio correspondiente.
 *
 * @async
 * @function altaTipo
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Datos recibidos.
 * @param {string} req.body.tipo - Nombre del tipo de clase a registrar.
 * @param {number} req.usuario.id_escuela - ID de la escuela extraído del token.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta estandarizada basada en MAPA_ALTA_TIPO_CLASE.
 */
const altaTipo = async( req : Request, res : Response) =>{
   const { tipo }  = req.body;

    const dataAlta = {
        tipo : tipo,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(req.usuario?.id_escuela)        
    };

    const altaResult = await servicioTipo.altaTipoClase(dataAlta);
    
    const config = MAPA_ALTA_TIPO_CLASE[ altaResult.code]  || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            altaResult.message || config.msg,
            altaResult.data,
            undefined,
            altaResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            altaResult.message || config.msg,
            altaResult.code
        );
    };

};



/**
 * Controlador para la modificación de un tipo de clase existente.
 * * Extrae el ID del tipo desde los parámetros de la URL y el nuevo nombre
 * desde el cuerpo de la petición. Utiliza el `id_escuela` del usuario autenticado
 * para asegurar que la operación se realice dentro del contexto correcto.
 *
 * @async
 * @function modTipo
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string|number} req.params.id - ID único del tipo de clase a modificar.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.tipo - Nuevo nombre del tipo de clase.
 * @param {number} req.usuario.id_escuela - ID de la escuela extraído del token.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta estandarizada basada en MAPA_MOD_TIPO_CLASE.
 */
const modTipo = async( req : Request, res : Response ) => {
    const { tipo } = req.body;
    const { id } = req.params;

    const tipoMod = {
        tipo : tipo,
        id   : Number(id),
        id_escuela : Number(req.usuario?.id_escuela)
    };

    const modResult = await servicioTipo.modTipoClase(tipoMod);

    const config = MAPA_MOD_TIPO_CLASE[ modResult.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            modResult.message || config.msg,
            modResult.data,
            undefined,
            modResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            modResult.message || config.msg,
            modResult.code
        );
    };    

};


/**
 * Controlador para la actualización del estado (activo/inactivo) de un tipo de clase.
 * * Extrae el ID y el nuevo estado desde los parámetros de la URL, e inyecta 
 * el `id_escuela` del usuario autenticado para garantizar la seguridad 
 * y el aislamiento de datos.
 *
 * @async
 * @function estadoTipo
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {string|number} req.params.id - ID único del tipo de clase.
 * @param {string} req.params.estado - Nuevo estado a asignar ('activos' o 'inactivos').
 * @param {number} req.usuario.id_escuela - ID de la escuela extraído del token.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta estandarizada basada en MAPA_ESTADO_TIPO_CLASE.
 */
const estadoTipo = async( req : Request, res : Response ) =>{
    const { id , estado} = req.params;

    const estadoData = {
         estado : estado,  id : Number(id) , id_escuela : Number(req.usuario?.id_escuela)
    };

    const estadoResult = await servicioTipo.estadoTipo( estadoData );

    const config = MAPA_ESTADO_TIPO_CLASE[ estadoResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            estadoResult.message || config.msg,
            estadoResult.data,
            undefined,
            estadoResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            estadoResult.message || config.msg,
            estadoResult.code
        );
    }; 

};


/**
 * Controlador para la obtención de un listado paginado de tipos de clase.
 * * Extrae los filtros y parámetros de paginación desde el query de la URL,
 * calcula el desplazamiento (offset) y delega la consulta al servicio,
 * asegurando que los resultados estén filtrados por la escuela del usuario.
 *
 * @async
 * @function listadoTipo
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta (filtros y paginación).
 * @param {string} [req.query.tipo] - Nombre del tipo para filtrar.
 * @param {string} [req.query.estado] - Estado del tipo para filtrar.
 * @param {number|string} req.query.pagina - Número de página actual.
 * @param {number|string} req.query.limite - Registros por página.
 * @param {number} req.usuario.id_escuela - ID de la escuela extraído del token.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta estandarizada basada en MAPA_LISTADO_TIPO_CLASE.
 */
const listadoTipo = async( req : Request, res : Response ) =>{
    const { tipo , estado , pagina , limite } = req.query;

    const offset = ( Number(pagina) -1 ) * Number(limite) ;

    const dataListado = {
        tipo : tipo,
        estado : estado,
        id_escuela : Number(req.usuario?.id_escuela),
        limite     : Number(limite),
        offset : offset,
        pagina : Number(pagina)    
    };

    const listadoResult = await servicioTipo.listadoTipoClases( dataListado);

    const config = MAPA_LISTADO_TIPO_CLASE[ listadoResult.code] || ERROR_INTERNO_SERVIDOR;
  
    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            listadoResult.message || config.msg,
            listadoResult.data,
            listadoResult.paginacion,
            listadoResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            listadoResult.message || config.msg,
            listadoResult.code
        );
    }; 

};


/**
 * Controlador para la obtención de un listado completo de tipos de clase (sin paginación).
 * * Extrae los filtros desde el query de la URL e inyecta el `id_escuela`
 * del usuario autenticado para asegurar que los resultados pertenezcan 
 * exclusivamente a la institución actual.
 *
 * @async
 * @function listadoTipoSinPaginacion
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta (filtros).
 * @param {string} [req.query.tipo] - Nombre del tipo para filtrar.
 * @param {string} [req.query.estado] - Estado del tipo para filtrar.
 * @param {number} req.usuario.id_escuela - ID de la escuela extraído del token.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta estandarizada basada en MAPA_LISTADO_TIPO_CLASE.
 */
const listadoTipoSinPaginacion = async( req : Request , res : Response)=>{

    const { tipo , estado } = req.query;

    const dataListado = {
        tipo : tipo,
        estado : estado,
        id_escuela : Number(req.usuario?.id_escuela)      
    };

    const listadoResult = await servicioTipo.listadoTipoClasesSinPag( dataListado );
    
    const config = MAPA_LISTADO_TIPO_CLASE[ listadoResult.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            listadoResult.message || config.msg,
            listadoResult.data,
            undefined,
            listadoResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            listadoResult.message || config.msg,
            listadoResult.code
        );
    }; 

};

export const method = {
    registro : tryCatch( altaTipo ),
    modTipo  : tryCatch( modTipo ),
    estado   : tryCatch( estadoTipo),
    listado  : tryCatch( listadoTipo),
    listadoSinPaginacion : tryCatch( listadoTipoSinPaginacion)
};