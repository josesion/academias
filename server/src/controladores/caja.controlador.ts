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
import { MAPA_METRICAS_PANEL, ERROR_INTERNO_SERVIDOR, MAPA_CAJA_ABIERTA, 
        MAPA_LISTA_TIPO_CUENTAS, MAPA_ABRIR_CAJA, MAPA_LISTADO_CAJAS,
        MAPA_CERRAR_CAJA, MAPA_DETALLE_MOVIMIENTOS, MAPA_LISTADO_CATEGORIAS,
        MAPA_METRICA_PRINCIPAL,

} from "../respuestas/caja"; 


/**
 * Controlador para gestionar la apertura de una nueva caja.
 * * Extrae los datos del cuerpo de la petición, delega la lógica al servicio de cajas
 * y retorna una respuesta formateada según el resultado de la operación.
 * * @async
 * @function abrirCaja
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Datos de la caja.
 * @param {number} req.body.id_escuela - ID de la escuela donde se abre la caja.
 * @param {string} req.body.estado - Estado inicial de la caja (ej. 'abierta').
 * @param {number} req.body.id_usuario - ID del usuario que realiza la apertura.
 * @param {number} req.body.monto_inicial - Saldo inicial de la caja.
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Retorna una respuesta HTTP exitosa (200) o un error controlado.
 * * @example
 * // Éxito: retorna enviarResponse con status 200 y la data de la caja.
 * // Error: retorna enviarResponseError basado en MAPA_ABRIR_CAJA.
 */
const abrirCaja = async( req : Request, res : Response) =>{
       
    const dataCaja = {
        id_escuela : req.body.id_escuela,
        estado     : req.body.estado,
        id_usuario : req.body.id_usuario,
        monto_inicial : req.body.monto_inicial,
    
    };

   const abrirCajaResult = await cajaServicio.abrirCajaServicio( dataCaja );

   const config = MAPA_ABRIR_CAJA[abrirCajaResult.code]  || ERROR_INTERNO_SERVIDOR;

   if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
                res,
                config.status,
                abrirCajaResult.message || config.msg,
                abrirCajaResult.data,
                undefined,
                abrirCajaResult.code
        );  
   }else{
        return enviarResponseError(
                res,
                config.status,
                abrirCajaResult.message || config.msg,
                abrirCajaResult.code
        );
   };

};

/**
 * Controlador para registrar un nuevo movimiento (detalle) en una caja.
 * * Extrae y castea los datos de la petición, delega la creación del movimiento
 * al servicio de cajas y gestiona la respuesta HTTP según el resultado.
 * * @async
 * @function detalleCaja
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Datos del movimiento recibidos en el cuerpo.
 * @param {number|string} req.body.id_caja - ID de la caja (se castea a Number).
 * @param {number|string} req.body.id_categoria - ID de la categoría (se castea a Number).
 * @param {number|string} req.body.id_cuenta - ID de la cuenta/método (se castea a Number).
 * @param {number|string} req.body.id_usuario - ID del usuario operativo (se castea a Number).
 * @param {number|string} req.body.monto - Importe del movimiento (se castea a Number).
 * @param {string} req.body.descripcion - Motivo o descripción del movimiento.
 * @param {number|null} [req.body.referencia_id] - ID opcional de referencia externa.
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta formateada basada en MAPRA_DETALLE_MOVIMIENTOS.
 */
const detalleCaja = async ( req : Request, res : Response ) => {
    const dataDetalle = {
        id_caja : Number(req.body.id_caja),
        id_categoria : Number(req.body.id_categoria),
        id_cuenta : Number(req.body.id_cuenta),
        id_usuario : Number(req.body.id_usuario),
        monto : Number(req.body.monto),
        descripcion : req.body.descripcion,
        referencia_id : req.body.referencia_id 
    };
    
    const detalleCajaResult = await cajaServicio.detalleCaja(dataDetalle);
    
    const config =  MAPA_DETALLE_MOVIMIENTOS[ detalleCajaResult.code]  || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(
               res,
               config.status,
               detalleCajaResult.message || config.msg,
               detalleCajaResult.data,
               undefined,
               detalleCajaResult.code
        );
    }else{
        return enviarResponseError(
               res, 
               config.status,
               detalleCajaResult.message || config.msg,
               detalleCajaResult.code
        );
    };
   
};

/**
 * Controlador para gestionar el cierre de una caja activa.
 * * Recibe los datos del arqueo físico, identifica al usuario que cierra y 
 * delega al servicio la actualización de saldos y estados.
 * * @async
 * @function cierreCaja
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {number} req.body.id_caja - ID único de la caja a cerrar.
 * @param {number} req.body.monto_final_real - Monto físico contado por el usuario.
 * @param {number|string} req.body.id_escuela - ID de la escuela (se castea a Number).
 * @param {number|string} req.body.id_usuario - ID del usuario que cierra (se castea a Number).
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta HTTP formateada según el MAPA_CERRAR_CAJA.
 */
const cierreCaja = async( req : Request, res : Response) =>{

    const data = { 
        id_caja : req.body.id_caja,
        monto_final_real : req.body.monto_final_real,
        id_escuela : Number(req.body.id_escuela),
        id_usuario : Number(req.body.id_usuario),
    };

     const cierreCajaResult = await cajaServicio.cierreCajaServicio( data );
   
    const config = MAPA_CERRAR_CAJA[ cierreCajaResult.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res, 
            config.status,
            cierreCajaResult.message || config.msg,
            cierreCajaResult.data,
            undefined,
            cierreCajaResult.code
        );    
    }else{
        return enviarResponseError(
            res, 
            config.status,
            cierreCajaResult.message || config.msg,
            cierreCajaResult.code
        );
    };

};  


/**
 * Controlador para obtener el ID de la caja que se encuentra actualmente abierta.
 * * Este endpoint es clave para procesos que requieren validar si existe una jornada 
 * activa antes de permitir registros de movimientos.
 * * @async
 * @function idCajaAbierta
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {number|string} req.params.id_escuela - ID de la escuela para filtrar la búsqueda (se castea a Number).
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta con el ID de la caja abierta o error controlado según MAPA_CAJA_ABIERTA.
 */
const idCajaAbierta =async ( req : Request, res : Response) =>{
   
    const data = { id_escuela : Number(req.params.id_escuela)};

    const idCajaAbiertaResult = await cajaServicio.idCajaAbiertaServicio(data);
 
    const config = MAPA_CAJA_ABIERTA[ idCajaAbiertaResult.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(
               res,
               config.status,
               idCajaAbiertaResult.message  || config.msg,
               idCajaAbiertaResult.data ,
               undefined,
               idCajaAbiertaResult.code
        );
    }else{
       return enviarResponseError(
              res,
              config.status,
              idCajaAbiertaResult.message || config.msg,
              idCajaAbiertaResult.code
       ); 
    };
};

/**
 * Controlador para obtener las métricas financieras de una caja específica.
 * * Extrae los identificadores de la URL, consulta al servicio de métricas
 * y retorna el resumen de saldos y estados de cuentas para el panel.
 * * @async
 * @function listaMetricasCaja
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de ruta.
 * @param {number|string} req.params.id_caja - ID de la caja a analizar (se castea a Number).
 * @param {number|string} req.params.id_escuela - ID de la escuela para validación de contexto (se castea a Number).
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta HTTP con las métricas o error según MAPA_METRICAS_PANEL.
 * * @example
 * // GET /metricas/5/1 (Caja 5, Escuela 1)
 */
const listaMetricasCaja = async ( req : Request, res : Response) => {
     const data = { id_caja : Number(req.params.id_caja), id_escuela : Number(req.params.id_escuela)};

     const metricasResult = await  cajaServicio.listaMetricasCaja( data );
   
     const config = MAPA_METRICAS_PANEL[metricasResult.code] || ERROR_INTERNO_SERVIDOR;

     if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            metricasResult.message || config.msg,
            metricasResult.data,
            undefined,
            metricasResult.code
        );
     }else{
        return enviarResponseError(
            res,
            config.status,
            metricasResult.message || config.msg,
            metricasResult.code
        );
     };

};

/**
 * Controlador para listar los movimientos asociados a una caja específica.
 * * Obtiene el detalle de transacciones (ingresos/egresos) permitiendo 
 * paginación mediante el uso de limite y offset.
 * * @async
 * @function movimientosCaja
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de búsqueda en la URL.
 * @param {number|string} req.query.id_caja - ID de la caja de la cual se quieren ver los movimientos (se castea a Number).
 * @param {number|string} [req.query.limite=10] - Cantidad máxima de registros a devolver (opcional, por defecto 10).
 * @param {number|string} [req.query.offset=0] - Número de registros a saltar para la paginación (opcional, por defecto 0).
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta con el listado de movimientos o error controlado según MAPA_LISTADO_CAJAS.
 */
const movimientosCaja = async ( req : Request, res : Response) => {
    const data = {
        id_caja : Number(req.query.id_caja),
        limite : Number(req.query.limite) || 10,
        offset : Number(req.query.offset) || 0
    };
    const movimientosResult = await cajaServicio.movimientosCaja( data );

    const config = MAPA_LISTADO_CAJAS[ movimientosResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK ) {
        return enviarResponse(
            res, 
            config.status,
            movimientosResult.message  ||  config.msg,
            movimientosResult.data,
            undefined,
            movimientosResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            movimientosResult.message || config.msg,
            movimientosResult.code
        );
    };      
};

/**
 * Obtiene las métricas financieras principales de una caja específica.
 * * Esta función actúa como controlador para consultar el estado actual de la caja,
 * procesando el monto inicial, los ingresos, los egresos y el balance total.
 * Utiliza un mapa de configuración (MAPA_METRICA_PRINCIPAL) para determinar
 * la respuesta HTTP adecuada basada en el código retornado por el servicio.
 * * @async
 * @function metricasCajaPrincipal
 * @param {Request} req - Objeto de solicitud de Express.
 * @param {number} req.params.id_caja - El ID de la caja a consultar.
 * @param {number} req.params.id_escuela - El ID de la escuela propietaria de la caja.
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} Envía una respuesta HTTP con el resumen de métricas 
 * o un error en caso de fallo.
 * * @throws {Error} Si ocurre un error interno en el servidor que no está 
 * contemplado en el mapa de respuestas.
 */
const metricasCajaPrincipal = async ( req : Request, res : Response ) => {
    
    const data = {
        id_caja : Number(req.params.id_caja),
        id_escuela : Number(req.params.id_escuela)
     };
     const metricasResult = await cajaServicio.metricasPrincipal( data );

     const config  = MAPA_METRICA_PRINCIPAL[metricasResult.code]  || ERROR_INTERNO_SERVIDOR;
     
     if ( config.status = CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            metricasResult.message ||  config.msg,
            metricasResult.data,
            undefined,
            metricasResult.code
        );
     }else{
        return enviarResponseError(
            res, 
            config.status,
            metricasResult.message ||  config.msg,
            metricasResult.code
        );
     };
};


/**
 * Controlador para listar las categorías de caja filtradas por tipo y estado.
 * * Permite obtener las categorías (ej: 'Ingreso', 'Egreso') asociadas a una escuela 
 * específica, filtrando opcionalmente por su estado (activo/inactivo).
 * * @async
 * @function listarCategoriaCajaTipos
 * @param {Request} req - Objeto de petición de Express.
 * @param {Object} req.params - Parámetros de la ruta.
 * @param {number|string} req.params.id_escuela - ID de la escuela (se castea a Number).
 * @param {string} req.params.tipo - Tipo de categoría a filtrar (ej: 'ingreso', 'egreso').
 * @param {string} req.params.estado - Estado de la categoría (ej: 'activo', 'inactivo').
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta con el listado de categorías o error según MAPA_LISTADO_CATEGORIAS.
 * * @example
 * // GET /categorias/1/ingreso/activo
 */
const listarCategoriaCajaTipos = async ( req : Request, res : Response) => {
   
    const data = {
        id_escuela : Number(req.params.id_escuela),
        tipo : req.params.tipo as string,
        estado : req.params.estado as string
    };

    const listaCategoriaResult = await cajaServicio.listaCategiriaCajaTipos( data );

    const config = MAPA_LISTADO_CATEGORIAS[ listaCategoriaResult.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(
             res,
             config.status,
             listaCategoriaResult.message || config.msg,
             listaCategoriaResult.data,
             undefined,
             listaCategoriaResult.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            listaCategoriaResult.message || config.msg,
            listaCategoriaResult.code
        );
    };         
};


/**
 * Controlador para obtener el listado de cuentas configuradas en una escuela.
 * * Extrae los parámetros de la URL, consulta el servicio de caja y gestiona
 * la respuesta HTTP utilizando el mapa de códigos de error/éxito correspondiente.
 *
 * @async
 * @function listaTipoCuentas
 * @param {Request} req - Objeto de petición de Express.
 * @param {string} req.params.id_escuela - ID de la escuela (se convierte a Number).
 * @param {string} req.params.estado - Estado de las cuentas a filtrar (ej. 'activos').
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta JSON enviada a través de `enviarResponse` o `enviarResponseError`.
 * * @example
 * // GET /api/caja/cuentas/107/activos
 * listaTipoCuentas(req, res);
 */
const listaTipoCuentas = async ( req : Request , res : Response) => {

  const data = {
    id_escuela : Number(req.params.id_escuela),
    estado : req.params.estado as string
  };

  const listaTipoCuentasResult = await cajaServicio.listaTipoCuentas( data);
   
  const config = MAPA_LISTA_TIPO_CUENTAS[listaTipoCuentasResult.code] || ERROR_INTERNO_SERVIDOR;

  if ( config.status === CodigoEstadoHTTP.OK){
    return enviarResponse(
        res,
        config.status,
        listaTipoCuentasResult.message || config.msg,
        listaTipoCuentasResult.data,
        undefined,
        listaTipoCuentasResult.code
    );
  }else{
    return enviarResponseError(
        res,
        config.status,
        listaTipoCuentasResult.message || config.msg,
        listaTipoCuentasResult.code
    );
  };
};

export const method ={
    abrirCaja : tryCatch( abrirCaja ),
    detalleCaja : tryCatch( detalleCaja),
    cierreCaja : tryCatch( cierreCaja),
    idCajaAbierta : tryCatch( idCajaAbierta ),
    movimientosCaja : tryCatch( movimientosCaja ),
    metricasPanel : tryCatch( metricasCajaPrincipal),
    listarCategoriaCajaTipos : tryCatch( listarCategoriaCajaTipos ),
    listaMetricasCaja : tryCatch( listaMetricasCaja),
    listaTipoCuentas : tryCatch( listaTipoCuentas),
};