import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { method as categoriaCajaServicio } from "../Servicio/categoria.cajas.serivcio";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

import { MAPA_LOCALIZAR_INSCRIPCION_CATEGORIA_CAJA, ERROR_INTERNO_SERVIDOR, MAPA_ALTA_CATEGORIA_CAJA,
         MAPA_MOD_CATEGORIA_CAJA,  MAPA_ESTADO_CATEGORIA_CAJA, MAPA_LISTADO_CATEGORIA_CAJA
 } from "../respuestas/categoria.cajas";

// ──────────────────────────────────────────────────────────────
// Sección de tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * Controlador para buscar el ID de la categoría 'Inscripcion' de una escuela específica.
 * * Esta función extrae el id_escuela de los parámetros de la ruta, consulta el servicio
 * de categorías y devuelve una respuesta estructurada. Es vital para procesos de 
 * automatización donde el sistema necesita identificar la categoría de ingreso base.
 *
 * @param {Request} req - Objeto de petición de Express. Debe contener id_escuela en params.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Devuelve una respuesta HTTP con el resultado de la búsqueda:
 * - 200 (OK): Categoría encontrada exitosamente.
 * - 404 (NOT_FOUND): La escuela no tiene una categoría de 'Inscripcion' definida.
 * - 500 (INTERNAL_SERVER_ERROR): Error inesperado en el servicio o base de datos.
 */
const buscarInscripcionCategoria = async ( req : Request, res : Response ) =>{   
    const data = { id_escuela : Number( req.usuario?.id_escuela)};

    const inscripcionCategoriaResult = await categoriaCajaServicio.verificacionInscripcionCategoria(data);

    const config = MAPA_LOCALIZAR_INSCRIPCION_CATEGORIA_CAJA[ inscripcionCategoriaResult.code ]  || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
         return enviarResponse(
            res,
            config.status,
            inscripcionCategoriaResult.message || config.msg ,
            inscripcionCategoriaResult.data,
            undefined,
            inscripcionCategoriaResult.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
            inscripcionCategoriaResult.message || config.msg ,
            inscripcionCategoriaResult.code
        );
    };

};


/**
 * Controlador para el alta de una nueva categoría de caja.
 * * Recibe los datos de la nueva categoría a través del cuerpo de la petición,
 * los procesa mediante el servicio correspondiente y retorna una respuesta
 * estandarizada basada en el mapa de configuración de estados.
 *
 * @async
 * @function altaCategoriaCaja
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición con los datos de la categoría.
 * @param {string} req.body.nombre_categoria - Nombre de la nueva categoría.
 * @param {string} req.body.tipo_movimiento - Tipo de movimiento ('ingreso' o 'egreso').
 * @param {string} req.body.estado - Estado inicial de la categoría.
 * @param {string|number} req.body.id_escuela - Identificador de la escuela asociada.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna valor; envía la respuesta HTTP mediante los helpers estandarizados `enviarResponse` o `enviarResponseError`.
 */
const altaCategoriaCaja = async( req : Request, res : Response) => {
    const data = {
        nombre_categoria: req.body.nombre_categoria,
        tipo_movimiento: req.body.tipo_movimiento,
        estado: req.body.estado,
        id_escuela : Number(req.usuario?.id_escuela)
    };
    
    const resutadoCategoriaCaja = await categoriaCajaServicio.altaCategoriaCajaServicio(data);

    const config = MAPA_ALTA_CATEGORIA_CAJA[ resutadoCategoriaCaja.code ]  || ERROR_INTERNO_SERVIDOR;

     if ( config.status === CodigoEstadoHTTP.OK){
         return enviarResponse(
            res,
            config.status,
            resutadoCategoriaCaja.message || config.msg ,
            resutadoCategoriaCaja.data,
            undefined,
            resutadoCategoriaCaja.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
            resutadoCategoriaCaja.message || config.msg ,
            resutadoCategoriaCaja.code
        );
    };  

};

/**
 * Controlador para la modificación de los datos de una categoría de caja existente.
 * * Extrae los identificadores y atributos de la categoría desde los parámetros de la URL
 * y la información del usuario desde el middleware de sesión, delegando la lógica
 * de actualización al servicio correspondiente.
 *
 * @async
 * @function modCategoriaCaja
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros dinámicos de la ruta.
 * @param {string|number} req.params.id - ID único de la categoría a modificar.
 * @param {string} req.params.nombre - Nuevo nombre para la categoría.
 * @param {string} req.params.movimiento - Tipo de movimiento asociado (ingreso/egreso).
 * @param {string} req.params.estado - Estado actual de la categoría.
 * @param {Object} [req.usuario] - Objeto de usuario inyectado por el middleware de autenticación.
 * @param {string|number} req.usuario.id_escuela - Identificador de la escuela del usuario autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna valor; envía la respuesta HTTP mediante los helpers estandarizados `enviarResponse` o `enviarResponseError`.
 */
const modCategoriaCaja = async( req : Request, res : Response) =>{
    const data = {
        id_categoria    : Number(req.params.id),
        nombre_categoria: req.params.nombre,
        tipo_movimiento : req.params.movimiento,
        estado          : req.params.estado,
        id_escuela : Number(req.usuario?.id_escuela)
    };

   
   const modCategoria = await categoriaCajaServicio.modCategoriaCaja(data);

    const config = MAPA_MOD_CATEGORIA_CAJA[  modCategoria.code ]  || ERROR_INTERNO_SERVIDOR;

     if ( config.status === CodigoEstadoHTTP.OK){
         return enviarResponse(
            res,
            config.status,
             modCategoria.message || config.msg ,
             modCategoria.data,
             undefined,
             modCategoria.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
             modCategoria.message || config.msg ,
             modCategoria.code
        );
    };  
};

/**
 * Controlador para gestionar el cambio de estado (baja o activación) de una categoría de caja.
 * * Extrae los datos de la petición, llama al servicio correspondiente para procesar la lógica 
 * de negocio y utiliza un mapa de configuración para determinar la respuesta HTTP adecuada.
 *
 * @async
 * @function bajaCategoriaCaja
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - Identificador de la categoría.
 * @param {string} req.params.estado - Nuevo estado deseado (ej: 'activos', 'inactivos').
 * @param {string} [req.params.nombre_categoria] - Nombre de la categoría a modificar.
 * @param {Object} [req.usuario] - Objeto de usuario inyectado por el middleware de autenticación.
 * @param {string|number} req.usuario.id_escuela - Identificador de la escuela del usuario autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna un valor directo; envía la respuesta final mediante `enviarResponse` o `enviarResponseError`.
 */
const bajaCategoriaCaja = async( req : Request, res : Response ) => {

    const dataBaja = {
        id_escuela : Number(req.usuario?.id_escuela),
        id_categoria : Number(req.params.id),
        estado : req.params.estado as string,
        nombre_categoria : req.params.nombre_categoria
    };

  
    const bajaCategoria = await categoriaCajaServicio.bajaCategoriaCaja( dataBaja );
    
    const config = MAPA_ESTADO_CATEGORIA_CAJA[  bajaCategoria.code ]  || ERROR_INTERNO_SERVIDOR;

     if ( config.status === CodigoEstadoHTTP.OK){
         return enviarResponse(
            res,
            config.status,
             bajaCategoria.message || config.msg ,
             bajaCategoria.data,
             undefined,
             bajaCategoria.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
            bajaCategoria.message || config.msg ,
            bajaCategoria.code
        );
    };  

};

/**
 * Controlador para la obtención del listado de categorías de caja.
 * * Extrae los parámetros de filtrado y paginación desde la query de la petición,
 * invoca al servicio correspondiente y gestiona la respuesta HTTP utilizando
 * un mapeo de configuraciones para estandarizar los estados.
 *
 * @async
 * @function listadoCategoriaCaja
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta (query strings).
 * @param {string} [req.query.categoria] - Nombre de la categoría para filtrar.
 * @param {string} [req.query.tipo] - Tipo de movimiento para filtrar.
 * @param {string} [req.query.estado] - Estado de la categoría para filtrar.
 * @param {string|number} [req.query.limite] - Cantidad de registros por página.
 * @param {string|number} [req.query.pagina] - Número de página solicitado.
 * @param {Object} [req.usuario] - Objeto de usuario inyectado por el middleware de autenticación.
 * @param {number} req.usuario.id_escuela - ID de la escuela del usuario autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna un valor directo, envía la respuesta a través de `enviarResponse` o `enviarResponseError`.
 */
const listadoCategoriaCaja = async( req : Request, res : Response) =>{
    
    const data = {
        nombre_categoria : req.query.categoria,
        tipo_movimiento  : req.query.tipo,
        estado           : req.query.estado,
        id_escuela       : Number(req.usuario?.id_escuela),
        limit            : Number(req.query.limite),
        pagina : Number(req.query.pagina)
    };
    

    const resultadoListado = await categoriaCajaServicio.listadoCategoriaCaja(data);


    const config = MAPA_LISTADO_CATEGORIA_CAJA[  resultadoListado.code ]  || ERROR_INTERNO_SERVIDOR;

     if ( config.status === CodigoEstadoHTTP.OK){

         return enviarResponse(
             res,
             config.status,
             resultadoListado.message || config.msg ,
             resultadoListado.data,
             resultadoListado.paginacion,
             resultadoListado.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
            resultadoListado.message || config.msg ,
            resultadoListado.code
        );
    }; 

};

export const method = {
    altaCategoriaCaja : tryCatch(altaCategoriaCaja),
    modCategoriaCaja  : tryCatch(modCategoriaCaja),
    bajaCategoriaCaja : tryCatch(bajaCategoriaCaja),
    listadoCategoriaCaja : tryCatch( listadoCategoriaCaja ),
    buscarInscripcionCategoria : tryCatch( buscarInscripcionCategoria )
};


