import { Response, Request} from "express";
import { method as cajaServicio } from "../Servicio/caja.servicio";
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
// ──────────────────────────────────────────────────────────────
// Sección de tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";



/**
 * Endpoint para la apertura de caja de una academia.
 * * @async
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {number} req.body.id_escuela - ID de la escuela.
 * @param {string} req.body.estado - Estado inicial (ej: 'abierta').
 * @param {number|null} [req.body.id_usuario] - ID del usuario (opcional).
 * @param {number} req.body.monto_inicial - Monto de apertura.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP estandarizada.
 * * @description
 * Recibe los datos del cliente, invoca al servicio de apertura y mapea los resultados
 * a los códigos de estado HTTP correspondientes:
 * - 409 (Conflict): Si ya hay una caja abierta.
 * - 200 (OK): Apertura exitosa.
 * - 500 (Internal Server Error): Errores inesperados.
 */
const abrirCaja = async( req : Request, res : Response) =>{
       
    const dataCaja = {
        id_escuela : req.body.id_escuela,
        estado     : req.body.estado,
        id_usuario : req.body.id_usuario || null,
        monto_inicial : req.body.monto_inicial
    };

   const abrirCajaResult = await cajaServicio.abrirCajaServicio( dataCaja );

   switch ( abrirCajaResult.code) {
        case "CAJA_ABIERTA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                abrirCajaResult.message,
                abrirCajaResult.code
            );
        };
        case "CAJA_ABIERTA_OK" : {
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                abrirCajaResult.message,
                abrirCajaResult.data,
                undefined,
                abrirCajaResult.code
            );
        };
        default : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                abrirCajaResult.message,
                "EXCEPTION_ERROR"
            );
        };
   };
};

/**
 * Endpoint para registrar un movimiento en el detalle de caja.
 * * Este controlador actúa como puerta de entrada para la creación de ingresos o egresos.
 * Extrae los datos del cuerpo de la petición y delega la validación y persistencia
 * al servicio de caja.
 * * @async
 * @param {Request} req - Objeto de petición de Express. Contiene los campos del movimiento en `req.body`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} 
 * - 200 (OK): Si el detalle se creó correctamente.
 * - 500 (Internal Server Error): Si hubo un fallo en la lógica de negocio o base de datos.
 * * @description
 * Los datos extraídos son: `id_caja`, `id_categoria`, `monto`, `metodo_pago`, `descripcion` y `referencia_id`.
 * Se utiliza la utilidad `enviarResponse` para estandarizar la salida del API.
 */
const detalleCaja = async ( req : Request, res : Response ) => {
    const dataDetalle = {
        id_caja : req.body.id_caja,
        id_categoria : req.body.id_categoria,
        monto : req.body.monto,
        metodo_pago : req.body.metodo_pago,
        descripcion : req.body.descripcion,
        referencia_id : req.body.referencia_id 
    };
    
    const detalleCajaResult = await cajaServicio.detalleCaja(dataDetalle);
    
    if (detalleCajaResult.code === "DETALLE_CAJA_OK"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            detalleCajaResult.message,
            detalleCajaResult.data,
            undefined,
            detalleCajaResult.code
        );
    };

    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            detalleCajaResult.message,
            detalleCajaResult.code
    );   
};

/**
 * Controlador para procesar el cierre definitivo de una caja.
 * * Este endpoint recibe el monto físico reportado y coordina con el servicio 
 * la verificación de estado y el arqueo contable.
 * * @async
 * @param {Request} req - Petición de Express. Espera `id_caja`, `monto_final_real` e `id_escuela`.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>}
 * * @description
 * Maneja tres escenarios de respuesta:
 * 1. **ÉXITO (200 OK)**: La caja se cerró y se guardaron los montos correctamente.
 * 2. **CONFLICTO (409)**: No se encontró una caja abierta para realizar el cierre.
 * 3. **ERROR (500)**: Fallo inesperado en el arqueo o en la actualización de la base de datos.
 * * Importante: La validación de que `monto_final_real` no sea vacío se delega al `cierreCajaServicio`.
 */
const cierreCaja = async( req : Request, res : Response) =>{

    const data = { 
        id_caja : req.body.id_caja,
        monto_final_real : req.body.monto_final_real,
        id_escuela : Number(req.body.id_escuela)
    };
    const cierreCajaResult = await cajaServicio.cierreCajaServicio( data );
   
 
    if (cierreCajaResult.code === "CIERRE_CAJA_OK"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            cierreCajaResult.message,
            cierreCajaResult.data,
            undefined,
            cierreCajaResult.code
        );
    };


    if (cierreCajaResult.code === "NO_HAY_CAJA_ABIERTA"){
       return enviarResponseError(
            res, 
            CodigoEstadoHTTP.CONFLICTO,
            cierreCajaResult.message,
            cierreCajaResult.code
       );
    };

    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            cierreCajaResult.message,
            cierreCajaResult.code
    ); 
};  


/**
 * Controlador para obtener el ID de la caja actualmente abierta de una escuela.
 * * Verifica si existe una sesión de caja activa para la escuela proporcionada.
 * Es un paso obligatorio antes de realizar cualquier movimiento de tesorería (ingresos/egresos),
 * asegurando que los fondos se asignen a una sesión de caja válida.
 *
 * @param {Request} req - Objeto de petición de Express. Debe incluir id_escuela en los parámetros.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP:
 * - 200 (OK): Retorna el ID de la caja abierta.
 * - 404 (NOT_FOUND): No hay ninguna caja abierta para esa escuela.
 * - 500 (INTERNAL_SERVER_ERROR): Error crítico al consultar el estado de la caja.
 */
const idCajaAbierta =async ( req : Request, res : Response) =>{
   
    const data = { id_escuela : Number(req.params.id_escuela)};

    const idCajaAbiertaResult = await cajaServicio.idCajaAbiertaServicio(data);
 
    if ( idCajaAbiertaResult.code === "ID_CAJA_OK"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            idCajaAbiertaResult.message,
            idCajaAbiertaResult.data,
            undefined,
            idCajaAbiertaResult.code
        );
    };
    if ( idCajaAbiertaResult.code === "SIN_CAJA_ABIERTA"){
        return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                idCajaAbiertaResult.message,
                idCajaAbiertaResult.code
        );        
    };

    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            idCajaAbiertaResult.message,
            idCajaAbiertaResult.code
    ); 
};

/**
 * Handler de Express para obtener las métricas del panel de caja.
 * * @async
 * @param {Request} req - Objeto de petición de Express (espera params: id_caja, id_escuela).
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} 
 * - 200: Si se obtienen las métricas correctamente.
 * - 404: Si no se encuentran métricas (caja inexistente).
 * - 500: Si ocurre un error inesperado en el servidor.
 */
const metricasPanelCaja = async ( req : Request, res : Response) =>{
    const data = { id_caja : Number(req.params.id_caja), id_escuela : Number(req.params.id_escuela)};
    const metricasResult = await cajaServicio.metricaPanelPrincipal( data );

    if ( metricasResult.code === "SIN_METRICAS"){
        return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                "Sin Metricas para Caja",
                "SIN_METRICAS"
        );         
    };


    if ( metricasResult.code === "METRICAS_OK"){
        return enviarResponse(
            res, 
            CodigoEstadoHTTP.OK,
            metricasResult.message,
            metricasResult.data,
            undefined ,
            metricasResult.code
        );
    };
    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            "Error , Metricas Caja server Error",
            metricasResult.code
    );    
};


/**
 * Endpoint de Express para listar movimientos de caja.
 * Extrae parámetros de la URL, delega la lógica al servicio y despacha la respuesta HTTP.
 * * @param {Request} req - Objeto de petición Express. Espera query params: id_caja, limite, offset.
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<Response>} Respuesta JSON con estado HTTP correspondiente.
 */
const movimientosCaja = async ( req : Request, res : Response) => {
    const data = {
        id_caja : Number(req.query.id_caja),
        limite : Number(req.query.limite) || 10,
        offset : Number(req.query.offset) || 0
    };
    const movimientosResult = await cajaServicio.movimientosCaja( data );
    
    if ( movimientosResult.code === "MOVIMIENTOS_CAJA_OK"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            movimientosResult.message,
            movimientosResult.data,
            undefined,
            movimientosResult.code
        );
    };

    if ( movimientosResult.code === "MOVIMIENTOS_CAJA_VACIO" ){
        return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                "No se encontraron movimientos de caja",
                movimientosResult.code
        );         
    };

    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            "Error , Movimientos Caja server Error",
            movimientosResult.code
    );      
};

/**
 * Controlador de Express para obtener el listado de categorías de caja filtradas.
 * * Extrae los parámetros `id_escuela`, `tipo` y `estado` de la URL, invoca al 
 * servicio correspondiente y despacha la respuesta HTTP utilizando helpers estandarizados.
 * * @async
 * @function listarCategoriaCajaTipos
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id_escuela - ID de la escuela (se castea a Number).
 * @param {string} req.params.tipo - Tipo de movimiento ('ingreso' o 'egreso').
 * @param {string} req.params.estado - Estado de la categoría ('activo', etc.).
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna un valor, pero envía una respuesta JSON al cliente:
 * - 200 (OK): Si se listan las categorías correctamente.
 * - 404 (Not Found): Si la lista está vacía.
 * - 500 (Internal Server Error): Si ocurre un error inesperado en el servidor.
 */
const listarCategoriaCajaTipos = async ( req : Request, res : Response) => {
   
    const data = {
        id_escuela : Number(req.params.id_escuela),
        tipo : req.params.tipo as string,
        estado : req.params.estado as string
    };

    const listaCategoriaResult = await cajaServicio.listaCategiriaCajaTipos( data );

    if ( listaCategoriaResult.code === "LISTADO_CATEGORIA_OK"){
       return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            listaCategoriaResult.message,
            listaCategoriaResult.data,
            undefined,
            listaCategoriaResult.code
       );
    };

    if ( listaCategoriaResult.code = "LISTADO_CATEGORIA_VACIO"){
      return enviarResponseError(
            res,
            CodigoEstadoHTTP.NO_ENCONTRADO,
            listaCategoriaResult.message,
            listaCategoriaResult.code
      );  
    };

    return enviarResponseError(
            res,
            CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
            "Error , Problemas a devolver el listado",
            listaCategoriaResult.code
    );         
};

export const method ={
    abrirCaja : tryCatch( abrirCaja ),
    detalleCaja : tryCatch( detalleCaja),
    cierreCaja : tryCatch( cierreCaja),
    idCajaAbierta : tryCatch( idCajaAbierta ),
    metricasPanelCaja : tryCatch( metricasPanelCaja ),
    movimientosCaja : tryCatch( movimientosCaja ),
    listarCategoriaCajaTipos : tryCatch( listarCategoriaCajaTipos ),
};