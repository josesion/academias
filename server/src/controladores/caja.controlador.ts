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
        MAPA_METRICA_PRINCIPAL,

} from "../respuestas/caja"; 

import type { ResultMetrica, ResultMetricasPrincipal, ResultListaCuentas} from "../Servicio/caja.servicio";

import { 
         DetalleCajaInputs, CierresCajaInputs, IdCajaAbiertaInputs, PanelMetricasInputs, 
         ListaMovimientosCajaInputs, ListaCategoriaCajaTipoInputs, ListaTipoCuentasInputs, 
         MetricasPrincipalInputs, AperturaCajaInput,
 } from "../squemas/cajas"; 

import { 
         ResultDetalleCaja,DetalleCajaMovimiento, CategoríaCaja
 } from "../tipados/caja.data.tipado"; 




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



const idCajaAbierta =async ( req : Request, res : Response) =>{
  
    const id_escuela : IdCajaAbiertaInputs  = { id_escuela : Number( req.usuario?.id_escuela)} ;



    await handleControladores< IdCajaAbiertaInputs,{id_caja : number} >(
        res, id_escuela, cajaServicio.idCajaAbiertaServicio,  MAPA_CAJA_ABIERTA 
    );

};


const listaMetricasCaja = async ( req : Request, res : Response) => {


    const data :  PanelMetricasInputs = { 
        id_caja : Number(req.params.id_caja),
        id_escuela : Number(req.usuario?.id_escuela)
    };

    await handleControladores< PanelMetricasInputs,ResultMetrica[] >(
        res, data, cajaServicio.listaMetricasCaja,  MAPA_METRICAS_PANEL
    );

};


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



const metricasCajaPrincipal = async ( req : Request, res : Response ) => {
    
    const data : MetricasPrincipalInputs = {
        id_caja : Number(req.params.id_caja),
        id_escuela : Number(req.usuario?.id_escuela)
     };

     await handleControladores<MetricasPrincipalInputs,ResultMetricasPrincipal[] >(
        res, data, cajaServicio.metricasPrincipal, MAPA_METRICA_PRINCIPAL
     );
};



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


const listaTipoCuentas = async ( req : Request , res : Response) => {

  const data : ListaTipoCuentasInputs = {
    id_escuela : Number(req.usuario?.id_escuela),
    estado : req.params.estado as  "activos" | "inactivos"
  };

  await handleControladores< ListaTipoCuentasInputs, ResultListaCuentas[]>( 
    res, data, cajaServicio.listaTipoCuentas, MAPA_LISTA_TIPO_CUENTAS 
  );
};




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
    abrirCajaTransaccion : tryCatch( abrirCajaTransaccion )
};