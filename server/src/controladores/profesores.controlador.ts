import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { fechaHoy } from "../hooks/fecha";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

import { method as servicioProfesor } from "../Servicio/profesores.servicio";

// Typados
import { CodigoEstadoHTTP } from "../tipados/generico";
import {
     MAPA_ALTA_PROFESORES ,ERROR_INTERNO_SERVIDOR, MAPA_MOD_PROFESORES,
     MAPA_ESTADO_PROFESORES, MAPA_LISTADO_PROFESORES, MAPA_LISTADO_SIN_PAG_PROFESORES
 } from "../respuestas/profesores";



/**
 * Controlador para dar de alta un profesor.
 *
 * Recibe los datos del profesor desde el body de la petición,
 * construye el objeto de entrada agregando información del sistema
 * (fecha de creación, escuela y estado), ejecuta el alta mediante
 * el servicio correspondiente y devuelve una respuesta estandarizada.
 *
 * @async
 * @function altaProfesores
 * @param {Request} req - Objeto de petición de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP con el resultado de la operación.
 *
 * @property {string} req.body.dni - DNI del profesor.
 * @property {string} req.body.nombre - Nombre del profesor.
 * @property {string} req.body.apellido - Apellido del profesor.
 * @property {string} req.body.celular - Número de celular del profesor.
 *
 * @throws {Error} Puede propagar errores provenientes del servicio
 * de alta de profesores si no son manejados previamente.
 */
const altaProfesores = async( req : Request , res : Response ) => {
    const { dni , nombre , apellido , celular} = req.body ;

    const dataEntrada = {
            dni       : dni ,
            nombre    : nombre,
            apellido  : apellido,
            celular   : celular,

            fecha_creacion : fechaHoy(), 
            fecha_baja : null,
            id_escuela : ( req.usuario?.id_escuela),
            
            estado : "activos"
    };

    const altaResult = await servicioProfesor.altaProfesor( dataEntrada);

    const config = MAPA_ALTA_PROFESORES[ altaResult.code ] || ERROR_INTERNO_SERVIDOR;
 
    if ( config.status === CodigoEstadoHTTP.OK ) {
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
            altaResult.message ||  config.msg,
            altaResult.code
        );
    };

};

/**
 * Modifica los datos de un profesor existente.
 *
 * Obtiene el DNI desde los parámetros de la URL y los datos a modificar
 * desde el body de la petición. Luego ejecuta la actualización mediante
 * el servicio de profesores y devuelve una respuesta estandarizada.
 *
 * @async
 * @param {Request} req - Petición HTTP con el DNI y los datos a modificar.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la operación de modificación.
 *
 * @property {string} req.params.dni - DNI del profesor a modificar.
 * @property {string} req.body.nombre - Nuevo nombre del profesor.
 * @property {string} req.body.apellido - Nuevo apellido del profesor.
 * @property {string} req.body.celular - Nuevo número de celular del profesor.
 */

const modProfesores = async ( req : Request , res : Response )  => {

    const {dni } = req.params;
    const { nombre , apellido , celular} = req.body ;

    const dataMod = {
        dni         : dni, 
        id_escuela  : Number(req.usuario?.id_escuela),
        nombre      : nombre,    
        apellido    : apellido ,
        celular     : celular
    };
    

    const modResult = await servicioProfesor.modProfesor( dataMod );

    const config = MAPA_MOD_PROFESORES[ modResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res, 
            config.status ,
            modResult.message || config.msg,
            modResult.data,
            undefined,
            modResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status ,
            modResult.message || config.msg,

            modResult.code   
        );
    };

};

/**
 * Actualiza el estado de un profesor (activo/inactivo).
 *
 * Obtiene el DNI y el nuevo estado desde los parámetros de la petición,
 * ejecuta la actualización mediante el servicio de profesores y devuelve
 * una respuesta estandarizada.
 *
 * @async
 * @param {Request} req - Petición HTTP con el DNI y el estado.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado de la operación.
 *
 * @property {string} req.params.dni - DNI del profesor.
 * @property {string} req.params.estado - Nuevo estado del profesor.
 */
const estadoProfesor = async ( req : Request , res : Response ) => {
 
    const {dni , estado} = req.params ;
    const data = {dni : dni , id_escuela : Number(req.usuario?.id_escuela) , estado : estado };

    const estadoResult = await  servicioProfesor.estadoProfesor( data );

    const config  = MAPA_ESTADO_PROFESORES[ estadoResult.code ]  || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            estadoResult.message  ||  config.msg,
            estadoResult.data,
            undefined,
            estadoResult.code
        );   
    }else{
        return enviarResponseError(
            res, 
            config.status,
            estadoResult.message  ||  config.msg,
            estadoResult.code
        );
    }; 

};

/**
 * Obtiene un listado paginado de profesores.
 *
 * Permite filtrar por DNI, apellido y estado, además de
 * aplicar paginación mediante los parámetros de página y límite.
 *
 * @async
 * @param {Request} req - Petición HTTP con filtros y parámetros de paginación.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado del listado de profesores.
 *
 * @property {string} req.query.dni - DNI utilizado como filtro.
 * @property {string} req.query.apellido - Apellido utilizado como filtro.
 * @property {'activos' | 'inactivos'} req.query.estado - Estado utilizado como filtro.
 * @property {number} req.query.limit - Cantidad de registros por página.
 * @property {number} req.query.pagina - Número de página solicitada.
 */


const listadoProfesores = async( req : Request , res : Response ) => {
    

    const { dni , apellido , estado , limit , pagina} = req.query;  

    const offset = ( Number(pagina) -1 ) * Number(limit) ;

    const dataListado = {
        dni : String(dni),
        apellido : String(apellido),
        estado : String(estado) as 'activos' | 'inactivos',
        id_escuela : Number(req.usuario?.id_escuela),
        limit  : Number(limit),
        offset : Number(offset),       
        pagina : Number(pagina)
    };
   
    const listadoResult = await servicioProfesor.listadoProfesor( dataListado );

    const config = MAPA_LISTADO_PROFESORES[ listadoResult.code ]   ||  ERROR_INTERNO_SERVIDOR;
  

    if (config.status === CodigoEstadoHTTP.OK) {
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
 * Obtiene un listado de profesores sin aplicar paginación.
 *
 * Permite filtrar los resultados por DNI y estado.
 *
 * @async
 * @param {Request} req - Petición HTTP con los filtros de búsqueda.
 * @param {Response} res - Respuesta HTTP.
 * @returns {Promise<Response>} Resultado del listado de profesores.
 *
 * @property {string} req.query.dni - DNI utilizado como filtro.
 * @property {string} req.query.estado - Estado utilizado como filtro.
 */
const ListadoSinPaginacion = async( req : Request , res : Response ) => {
    const { dni , estado  } = req.query;


    const dataListado = {
        dni : String(dni),
        estado : estado ,
        id_escuela : Number(req.usuario?.id_escuela)        
    };

    const listadoResult = await servicioProfesor.listadoProfesorSinPag( dataListado );

    const config = MAPA_LISTADO_SIN_PAG_PROFESORES[ listadoResult.code ]  ||  ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ) {
        return enviarResponse(
            res,
            config.status,
            listadoResult.message  ||  config.msg,
            listadoResult.data,
            undefined,
            listadoResult.code
        );
    }else {
        return enviarResponseError(
            res,
            config.status,
            listadoResult.message  ||  config.msg,
            listadoResult.code          
        );
    };
    

};

export const method = {
    alta    : tryCatch( altaProfesores ),
    mod     : tryCatch( modProfesores ),
    estado  : tryCatch( estadoProfesor ), 
    listado : tryCatch( listadoProfesores),
    listadoSinPaginacion : tryCatch( ListadoSinPaginacion )
}