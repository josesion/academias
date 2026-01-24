import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { method as categoriaCajaServicio } from "../Servicio/categoria.cajas.serivcio";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

// ──────────────────────────────────────────────────────────────
// Sección de tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * Controlador HTTP para el registro de una nueva categoría de caja.
 * * Este endpoint se encarga de:
 * 1. Mapear el cuerpo de la petición (body) al objeto de datos de la categoría.
 * 2. Invocar el servicio de alta para procesar la lógica de negocio y validaciones.
 * 3. Responder con:
 * - 200 OK: Si la creación fue exitosa.
 * - 409 CONFLICT: Si la categoría ya existe (evita duplicados).
 * - 500 INTERNAL SERVER ERROR: Para cualquier otro fallo no contemplado.
 * * @async
 * @function altaCategoriaCaja
 * @param {Request} req - Objeto de petición Express (contiene nombre_categoria, tipo_movimiento, id_escuela).
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Envía la respuesta formateada al cliente.
 */
const altaCategoriaCaja = async( req : Request, res : Response) => {
    const data = {
        nombre_categoria: req.body.nombre_categoria,
        tipo_movimiento: req.body.tipo_movimiento,
        estado: req.body.estado,
        id_escuela : Number(req.body.id_escuela)
    };
    
    const resutadoCategoriaCaja = await categoriaCajaServicio.altaCategoriaCajaServicio(data);
   
    switch (resutadoCategoriaCaja.code) {
        case "CATEGORIA_CAJA_ALTA":{
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                resutadoCategoriaCaja.message,
                resutadoCategoriaCaja.data,
                undefined,
                resutadoCategoriaCaja.code
            );
        };
        case "CATEGORIA_CAJA_EXISTENTE" :{
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                resutadoCategoriaCaja.message,
                resutadoCategoriaCaja.code
            );
        };

        default : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                resutadoCategoriaCaja.message,
                resutadoCategoriaCaja.code
            );
        };
    };
};

/**
 * Controlador HTTP para la actualización de una categoría de caja existente.
 * * Este endpoint procesa la solicitud de cambio basándose en los parámetros de la URL:
 * 1. Captura los datos desde `req.params`, asegurando el tipado numérico para IDs.
 * 2. Delega al servicio la validación de duplicados y la persistencia.
 * 3. Gestiona los flujos de respuesta:
 * - 409 CONFLICT: Si el nuevo nombre ya está en uso por otra categoría.
 * - 200 OK: Si la modificación se realizó correctamente.
 * - 500 ERROR: Para fallos inesperados en el proceso.
 * * @async
 * @function modCategoriaCaja
 * @param {Request} req - Objeto de petición Express (contiene id, nombre, movimiento, estado e id_escuela en params).
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Ejecuta el envío de la respuesta HTTP.
 */
const modCategoriaCaja = async( req : Request, res : Response) =>{
    const data = {
        id_categoria    : Number(req.params.id),
        nombre_categoria: req.params.nombre,
        tipo_movimiento : req.params.movimiento,
        estado          : req.params.estado,
        id_escuela : Number(req.params.id_escuela)
    };
   
   const modCategoria = await categoriaCajaServicio.modCategoriaCaja(data);

    if ( modCategoria.code === "CATEGORIA_CAJA_EXISTENTE"){
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.CONFLICTO, 
            modCategoria.message,
            modCategoria.code 
        );
    };  

   if (modCategoria.code === "CATEGORIA_CAJA_MODIFICAR"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            modCategoria.message,
            modCategoria.data,
            undefined,
            modCategoria.code
        );
   };

   return enviarResponseError(
        res,
        CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        modCategoria.message,
        modCategoria.code
   );
};

/**
 * Controlador HTTP para gestionar la baja lógica o cambio de estado de una categoría.
 * * Este endpoint procesa la solicitud de activación/desactivación:
 * 1. Extrae identificadores y el nuevo estado desde los parámetros de la URL (`req.params`).
 * 2. Invoca la lógica de servicio para actualizar el estado del registro.
 * 3. Retorna:
 * - 200 OK: Si el estado se actualizó correctamente (con mensaje personalizado del servicio).
 * - 500 ERROR: Si ocurrió un fallo en la persistencia o validación.
 * * @async
 * @function bajaCategoriaCaja
 * @param {Request} req - Objeto de petición Express (espera id_escuela, id y estado en params).
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Envía la respuesta HTTP final.
 */
const bajaCategoriaCaja = async( req : Request, res : Response ) => {

    const dataBaja = {
        id_escuela : Number(req.params.id_escuela),
        id_categoria : Number(req.params.id),
        estado : req.params.estado as string
    };
    const bajaCategoria = await categoriaCajaServicio.bajaCategoriaCaja( dataBaja );
    
    if (bajaCategoria.code === "CATEGORIA_CAJA_ESTADO_OK"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            bajaCategoria.message,
            bajaCategoria.data,
            undefined,
            bajaCategoria.code
        );
    };

    return enviarResponseError(
        res,
        CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        bajaCategoria.message,
        bajaCategoria.code
    );
};

/**
 * Controlador HTTP para la obtención de categorías de caja.
 * * Este endpoint realiza las siguientes acciones:
 * 1. Mapea y normaliza los parámetros de búsqueda desde la Query String (`req.query`).
 * 2. Invoca el servicio de listado para procesar la búsqueda y paginación.
 * 3. Utiliza un `switch` para determinar la respuesta HTTP:
 * - 200 OK: Retorna el listado de categorías con sus metadatos de paginación.
 * - 404 NOT FOUND: Cuando la búsqueda no arroja resultados.
 * - 500 INTERNAL SERVER ERROR: Caso por defecto para errores no controlados.
 * * @async
 * @function listadoCategoriaCaja
 * @param {Request} req - Objeto de petición Express (espera categoria, tipo, estado, id_escuela, limite, pagina).
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>} Envía la respuesta JSON formateada al cliente.
 */
const listadoCategoriaCaja = async( req : Request, res : Response) =>{
    
    const data = {
        nombre_categoria : req.query.categoria,
        tipo_movimiento  : req.query.tipo,
        estado           : req.query.estado,
        id_escuela       : Number(req.query.id_escuela),
        limit            : Number(req.query.limite),
        pagina : Number(req.query.pagina)
    };
    
    const resultadoListado = await categoriaCajaServicio.listadoCategoriaCaja(data);
   
    switch (resultadoListado.code){
        case "LISTADO_CATEGORIA_CAJA" : {
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                resultadoListado.message,
                resultadoListado.data,
                resultadoListado.paginacion,
                resultadoListado.code    
            );
        };
        case "SIN_LISTADO_CATEGORIA_CAJA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                resultadoListado.message,
                resultadoListado.code
            );
        };
        default : {
             return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Ocurrió un error inesperado en la lógica del servicio.",
                "EXCEPTION_ERROR"
            );           
        };
    };
};

export const method = {
    altaCategoriaCaja : tryCatch(altaCategoriaCaja),
    modCategoriaCaja  : tryCatch(modCategoriaCaja),
    bajaCategoriaCaja : tryCatch(bajaCategoriaCaja),
    listadoCategoriaCaja : tryCatch( listadoCategoriaCaja )
};


