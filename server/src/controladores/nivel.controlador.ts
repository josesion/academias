import { Request , Response } from "express";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a servicios para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────

import { method as servicioNiveles } from "../Servicio/niveles.servicio";

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { tryCatch } from "../utils/tryCatch"; 
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
import { fechaHoy } from "../hooks/fecha"; 

import { MAPA_ALTA_NIVEL, ERROR_INTERNO_SERVIDOR , MAPA_MOD_NIVEL,
         MAPA_ESTADO_NIVEL, MAPA_LISTADO_NIVEL,
 } from "../respuestas/niveles";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────

import {  CodigoEstadoHTTP } from "../tipados/generico";

/**
 * Da de alta un nuevo nivel para la escuela del usuario autenticado.
 *
 * Obtiene los datos desde el body de la petición, construye
 * la información necesaria para el alta y devuelve una respuesta
 * estandarizada con el resultado de la operación.
 *
 * @async
 * @param {Request} req - Petición HTTP con los datos del nivel.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la operación.
 *
 * @property {string} req.body.nivel - Nombre del nivel a crear.
 */
const altaNivel = async ( req : Request , res : Response ) => {
    const  { nivel } = ( req.body );

    const dataNivel = {
        nivel,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(req.usuario?.id_escuela)
    };

    const altaResult = await servicioNiveles.altaNivel(dataNivel);
    console.log(altaResult)
    const config = MAPA_ALTA_NIVEL[ altaResult.code ] || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
  
        return enviarResponse(
            res,
            config.status,
            altaResult.message || config.msg,
            altaResult.data,
            undefined,
            altaResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            altaResult.message || config.msg,
            altaResult.code
        );
    }


};


/**
 * Modifica un nivel existente de la escuela del usuario autenticado.
 *
 * Obtiene el identificador del nivel desde los parámetros de la petición
 * y los nuevos datos desde el body. Luego ejecuta la modificación y
 * devuelve una respuesta estandarizada.
 *
 * @async
 * @param {Request} req - Petición HTTP con el id y los datos a modificar.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la operación.
 *
 * @property {number} req.params.id - Identificador del nivel.
 * @property {string} req.body.nivel - Nuevo nombre del nivel.
 */
const modNivel = async ( req : Request , res : Response ) => {
   
    const { id } = req.params;
    const { nivel } = req.body;

    const modData = {
        id : Number(id),
        nivel,
        id_escuela : Number(req.usuario?.id_escuela)     
    };

    const modResult = await servicioNiveles.modNivel( modData );
    
   const config = MAPA_MOD_NIVEL[ modResult.code ]   || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
     
        return enviarResponse(
            res,
            config.status,
            modResult.message || config.msg,
            modResult.data,
            undefined,
            modResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            modResult.message || config.msg,
            modResult.code
        );
    };

};


/**
 * Actualiza el estado de un nivel de la escuela del usuario autenticado.
 *
 * Obtiene el identificador y el nuevo estado desde los parámetros
 * de la petición, ejecuta la actualización y devuelve una respuesta
 * estandarizada con el resultado de la operación.
 *
 * @async
 * @param {Request} req - Petición HTTP con el id y el estado.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la operación.
 *
 * @property {number} req.params.id - Identificador del nivel.
 * @property {string} req.params.estado - Nuevo estado del nivel.
 * @property {string} req.body.nivel - Nombre del nivel.
 */
const estadoNivel = async(req : Request , res : Response )=> {

    const { id  , estado  } = req.params;
    const { nivel } = req.body ;

    
    const estadoData = {
        id : Number(id), 
        id_escuela : Number(req.usuario?.id_escuela),
        estado : estado,
        nivel : nivel        
    };


    const estadoResult = await servicioNiveles.estadoNivel( estadoData );

    const config = MAPA_ESTADO_NIVEL[ estadoResult.code ] || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
  
        return enviarResponse(
            res,
            config.status,
            estadoResult.message || config.msg,
            estadoResult.data,
            undefined,
            estadoResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            estadoResult.message || config.msg,
            estadoResult.code
        );
    };
};


/**
 * Obtiene un listado paginado de niveles.
 *
 * Permite filtrar los resultados por nivel y estado,
 * aplicando además los parámetros de paginación recibidos.
 *
 * @async
 * @param {Request} req - Petición HTTP con filtros y paginación.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la consulta.
 *
 * @property {string} req.query.nivel - Nombre del nivel utilizado como filtro.
 * @property {string} req.query.estado - Estado utilizado como filtro.
 * @property {number} req.query.limite - Cantidad de registros por página.
 * @property {number} req.query.pagina - Página solicitada.
 */
const listadoNivel = async( req : Request , res : Response ) =>{
    const { nivel , estado, limite, pagina} = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limite) ;

   const dataListado = {
        nivel : nivel,
        estado : estado,
        id_escuela : Number( req.usuario?.id_escuela ),
        limite : Number( limite ),
        offset  : Number( offset ),
        pagina : Number( pagina )    
   };

   const listaResult = await servicioNiveles.listadoNivel( dataListado );

   const config = MAPA_LISTADO_NIVEL[ listaResult.code ] || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
  
        return enviarResponse(
            res,
            config.status,
            listaResult.message || config.msg,
            listaResult.data,
            listaResult.paginacion,
            listaResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            listaResult.message || config.msg,
            listaResult.code
        );
    };   

};


/**
 * Obtiene un listado de niveles sin aplicar paginación.
 *
 * Permite filtrar los resultados por nombre de nivel y estado,
 * devolviendo todos los registros que coincidan con los criterios.
 *
 * @async
 * @param {Request} req - Petición HTTP con los filtros de búsqueda.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la consulta.
 *
 * @property {string} req.query.nivel - Nombre del nivel utilizado como filtro.
 * @property {string} req.query.estado - Estado utilizado como filtro.
 */
const listadoNivelSinPag = async( req : Request , res : Response ) =>{
    const { nivel , estado } = req.query;

    const dataListado = {
        nivel : nivel,
        estado : estado,
        id_escuela : Number( req.usuario?.id_escuela )          
    };

    const listaResult = await servicioNiveles.listadoNivelSinPag( dataListado );

   const config = MAPA_LISTADO_NIVEL[ listaResult.code ] || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
  
        return enviarResponse(
            res,
            config.status,
            listaResult.message || config.msg,
            listaResult.data,
            undefined,
            listaResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            listaResult.message || config.msg,
            listaResult.code
        );
    };     
};

export const method = {
    altaNivel : tryCatch( altaNivel ),
    modNivel  : tryCatch( modNivel ),
    estadoNivel : tryCatch( estadoNivel),
    listadoNivel : tryCatch( listadoNivel),
    listadoNivelSinPag : tryCatch( listadoNivelSinPag )
};  