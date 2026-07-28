import { Response, Request} from "express";
import { method as cajaServicio } from "../Servicio/caja.servicio";
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
// ──────────────────────────────────────────────────────────────
// Sección de tipados
// ──────────────────────────────────────────────────────────────

import { MAPA_METRICAS_PANEL, MAPA_CAJA_ABIERTA, 
        MAPA_LISTA_TIPO_CUENTAS, MAPA_ABRIR_CAJA, MAPA_LISTADO_CAJAS,
        MAPA_CERRAR_CAJA, MAPA_DETALLE_MOVIMIENTOS, MAPA_LISTADO_CATEGORIAS,
        MAPA_METRICA_PRINCIPAL, MAPA_LISTADO_CATEGORIAS_SESION

} from "../respuestas/caja"; 

import type { ResultMetrica, ResultMetricasPrincipal, ResultListaCuentas} from "../Servicio/caja.servicio";

import { 
         DetalleCajaInputs, CierresCajaInputs, IdCajaAbiertaInputs, PanelMetricasInputs, 
         ListaMovimientosCajaInputs, ListaCategoriaCajaTipoInputs, ListaTipoCuentasInputs, 
         MetricasPrincipalInputs, AperturaCajaInput, CuentasSesionInputs
 } from "../squemas/cajas"; 

import { 
         ResultDetalleCaja,DetalleCajaMovimiento, CategoríaCaja
 } from "../tipados/caja.data.tipado"; 



/**
 * Controlador HTTP encargado de registrar un nuevo movimiento o detalle en la caja (ingreso o egreso),
 * estructurando los datos enviados en el cuerpo de la petición junto con la información 
 * del usuario y la escuela autenticados.
 * 
 * @async
 * @function detalleCaja
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el body con los datos del movimiento (id_caja, id_categoria, id_cuenta, monto, descripción, etc.) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const detalleCaja = async ( req : Request, res : Response ) => {
    
    const dataDetalle : DetalleCajaInputs= {
        id_caja : Number(req.body.id_caja),
        id_escuela : Number(req.usuario?.id_escuela),
        id_categoria : Number(req.body.id_categoria),
        id_cuenta : Number(req.body.id_cuenta),
        id_usuario : Number(req.usuario?.id),
        monto : Number(req.body.monto),
        descripcion : req.body.descripcion,
        referencia_id : req.body.referencia_id 
    };
    
    await handleControladores<DetalleCajaInputs, ResultDetalleCaja>(
        res, dataDetalle, cajaServicio.detalleCaja, MAPA_DETALLE_MOVIMIENTOS
    );
   
};


/**
 * Controlador HTTP encargado de procesar el cierre de una caja, tomando los datos 
 * de arqueo, montos reales, del sistema y observaciones desde el cuerpo de la petición, 
 * junto con la información del usuario y escuela autenticados.
 * 
 * @async
 * @function cierreCaja
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el body con los datos del cierre y arqueo, y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const cierreCaja = async( req : Request, res : Response) =>{

    const data : CierresCajaInputs = { 
        id_caja : req.body.id_caja,
        id_usuario_cierre : Number(req.usuario?.id),
        id_usuario  : Number(req.usuario?.id),
        id_escuela : Number(req.usuario?.id_escuela), 
        monto_final_real : Number(req.body.monto_final_real) ,
        monto_sistema : Number(req.body.monto_sistema),
        diferencia_total : Number(req.body.diferencia_total),
        arqueo_detalle : req.body.arqueo_detalle,
        observaciones_cierre : req.body.observaciones_cierre
    };


    await handleControladores<CierresCajaInputs,{ id_caja : number , estado : string,} >(
        res, data, cajaServicio.cierreCajaServicio,MAPA_CERRAR_CAJA 
    );
};  


/**
 * Controlador HTTP encargado de consultar si existe una caja abierta para la escuela del usuario actual,
 * extrayendo el identificador de la escuela desde los datos del usuario autenticado.
 * 
 * @async
 * @function idCajaAbierta
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene la información del usuario autenticado.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const idCajaAbierta =async ( req : Request, res : Response) =>{
  
    const id_escuela : IdCajaAbiertaInputs  = { id_escuela : Number( req.usuario?.id_escuela)} ;



    await handleControladores< IdCajaAbiertaInputs,{id_caja : number} >(
        res, id_escuela, cajaServicio.idCajaAbiertaServicio,  MAPA_CAJA_ABIERTA 
    );

};


/**
 * Controlador HTTP encargado de obtener el panel de métricas detalladas para una caja específica,
 * extrayendo el identificador de la caja de los parámetros de ruta y el de la escuela
 * de los datos del usuario autenticado.
 * 
 * @async
 * @function listaMetricasCaja
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el id de la caja en los parámetros y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const listaMetricasCaja = async ( req : Request, res : Response) => {


    const data :  PanelMetricasInputs = { 
        id_caja : Number(req.params.id_caja),
        id_escuela : Number(req.usuario?.id_escuela)
    };

    await handleControladores< PanelMetricasInputs,ResultMetrica[] >(
        res, data, cajaServicio.listaMetricasCaja,  MAPA_METRICAS_PANEL
    );

};

/**
 * Controlador HTTP encargado de obtener el listado paginado de los movimientos de una caja,
 * extrayendo el identificador de la caja, el límite y el offset desde los parámetros de consulta (query params).
 * 
 * @async
 * @function movimientosCaja
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene los query params (id_caja, limite, offset).
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const movimientosCaja = async ( req : Request, res : Response) => {
    const data : ListaMovimientosCajaInputs = {
        id_caja : Number(req.query.id_caja),
        limite : Number(req.query.limite) || 10,
        offset : Number(req.query.offset) || 0
    };

    await handleControladores<ListaMovimientosCajaInputs,DetalleCajaMovimiento[] >(
        res, data, cajaServicio.movimientosCaja, MAPA_LISTADO_CAJAS
    );
   
};


/**
 * Controlador HTTP encargado de obtener las métricas principales de una caja específica,
 * extrayendo el identificador de la caja desde los parámetros de la ruta y el de la escuela
 * desde los datos del usuario autenticado.
 * 
 * @async
 * @function metricasCajaPrincipal
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el id de la caja en los parámetros y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const metricasCajaPrincipal = async ( req : Request, res : Response ) => {
    
    const data : MetricasPrincipalInputs = {
        id_caja : Number(req.params.id_caja),
        id_escuela : Number(req.usuario?.id_escuela)
     };

     await handleControladores<MetricasPrincipalInputs,ResultMetricasPrincipal[] >(
        res, data, cajaServicio.metricasPrincipal, MAPA_METRICA_PRINCIPAL
     );
};


/**
 * Controlador HTTP encargado de obtener el listado de categorías de caja 
 * filtrado por el tipo de movimiento (ingreso o egreso), su estado (activos o inactivos) 
 * y asociado a la escuela del usuario autenticado.
 * 
 * @async
 * @function listarCategoriaCajaTipos
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene los parámetros de ruta (tipo, estado) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const listarCategoriaCajaTipos = async ( req : Request, res : Response) => {
   
    const data : ListaCategoriaCajaTipoInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        tipo : req.params.tipo as "ingreso" | "egreso",
        estado : req.params.estado as "activos" | "inactivos"
    };

    await handleControladores<ListaCategoriaCajaTipoInputs, CategoríaCaja[] >(
        res, data, cajaServicio.listaCategiriaCajaTipos, MAPA_LISTADO_CATEGORIAS
    );       
};


/**
 * Controlador HTTP encargado de obtener el listado general de tipos de cuentas financieras 
 * (activos o inactivos) filtrados por la escuela del usuario autenticado.
 * 
 * @async
 * @function listaTipoCuentas
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene los parámetros de ruta (estado) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const listaTipoCuentas = async ( req : Request , res : Response) => {

  const data : ListaTipoCuentasInputs = {
    id_escuela : Number(req.usuario?.id_escuela),
    estado : req.params.estado as  "activos" | "inactivos"
  };

  await handleControladores< ListaTipoCuentasInputs, ResultListaCuentas[]>( 
    res, data, cajaServicio.listaTipoCuentas, MAPA_LISTA_TIPO_CUENTAS 
  );
};

/**
 * Controlador HTTP encargado de obtener las cuentas financieras asociadas a la sesión de caja actual.
 * Extrae la información de la escuela y del usuario desde la petición y utiliza el manejador 
 * de controladores para ejecutar el servicio correspondiente.
 * 
 * @async
 * @function cuentasSesion
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene los datos del usuario autenticado.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const cuentasSesion = async( req : Request , res : Response) =>{

    const data : CuentasSesionInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)    
    };

    await handleControladores<CuentasSesionInputs ,{ id_cuenta :number, nombre_cuenta : string , tipo_cuenta : string}[]>(
        res, data, cajaServicio.serviciosCuentaSesion, MAPA_LISTADO_CATEGORIAS_SESION
    );

};


/**
 * Controlador HTTP encargado de procesar la solicitud de apertura de caja.
 * Extrae los datos del usuario autenticado y del cuerpo de la petición, 
 * estructurándolos para pasarlos al servicio de apertura de caja a través del manejador de controladores.
 * 
 * @async
 * @function abrirCajaTransaccion
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene la información del usuario autenticado y el body con el detalle.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const abrirCajaTransaccion =async (req : Request , res : Response) => {
  
    const dataCaja :  AperturaCajaInput = {
        id_escuela : Number( req.usuario?.id_escuela),
        estado     : req.body.estado,
        id_usuario_apertura :Number(req.usuario?.id),
        detalle : req.body.detalle,
        id_usuario : Number(req.usuario?.id)
    };

   await handleControladores< AperturaCajaInput, {}>(// cuando cree el historial agregar el tipado de respuesta
        res, dataCaja, cajaServicio.aperturaCajaTransaccion, MAPA_ABRIR_CAJA
   );

};

export const method ={
    detalleCaja : tryCatch( detalleCaja),
    cierreCaja : tryCatch( cierreCaja),
    idCajaAbierta : tryCatch( idCajaAbierta ),
    movimientosCaja : tryCatch( movimientosCaja ),
    metricasPanel : tryCatch( metricasCajaPrincipal),
    listarCategoriaCajaTipos : tryCatch( listarCategoriaCajaTipos ),
    listaMetricasCaja : tryCatch( listaMetricasCaja),
    listaTipoCuentas : tryCatch( listaTipoCuentas),
    abrirCajaTransaccion : tryCatch( abrirCajaTransaccion ),
    cuentasSesion : tryCatch( cuentasSesion )
};