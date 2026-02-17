import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import type * as TipadoCaja from "../tipadosTs/caja.typado";

export const registrarMovimientoCaja = async ( data : TipadoCaja.DataDetalleCaja) 
: Promise<ApiResponse<TipadoCaja.ResultDetalleCaja>> => {
 const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };   
 
    const ruta  = `${PAGINA}api/detalle_caja`;     
    return await apiFetch( ruta ,{
        method : "POST",
        body  : {
            id_caja : data.id_caja,
            id_categoria : data.id_categoria,
            monto : data.monto,
            metodo_pago : data.metodo_pago,
            descripcion : data.descripcion,
            referencia_id : data.referencia_id
        }
    } ); 
};


export const obtenerIdCaja = async ( id_escuela : TipadoCaja.idCajaAbierta)
: Promise<ApiResponse<{ id_caja : number}>> =>{
  const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };    
    const ruta = `${PAGINA}api/id_caja/${id_escuela}`;
    return await apiFetch( ruta , {
        method : "GET"
    });
};

export const metricasPanelCaja = async ( data : TipadoCaja.MetricasCaja)
: Promise<ApiResponse<TipadoCaja.MetricaPanelPrincipal>> => {
   const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };  
    const {id_caja , id_escuela} = data ;
  
    const ruta = `${PAGINA}api/metricas_caja/${id_caja}/${id_escuela}`;   
    return await apiFetch(ruta, {
        method : "GET"
    });
    
};

export const abrirCaja = async (data : TipadoCaja.AperturaCajaInputs)
: Promise<ApiResponse<TipadoCaja.AperturaCajaRespuesta>> => {
    const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };
    const { id_escuela, estado , id_usuario , monto_inicial} = data ;
    const ruta = `${PAGINA}api/caja_apertura`;  
    return await apiFetch( ruta,  {
        method : "POST",
        body : {
            id_escuela : id_escuela,
            estado     : estado,
            id_usuario : id_usuario,
            monto_inicial : monto_inicial     
        }
    });

};

export const cerrarCaja = async ( data : TipadoCaja.CierreCajaData) 
: Promise<ApiResponse<TipadoCaja.CierreCajaRespuesta>>=> {
    const verificarUser= await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }; 
    const { id_caja , id_escuela , monto_final_real} = data ; 
    const ruta = `${PAGINA}api/cierre_caja`;
    return await apiFetch( ruta , {
        method : "POST",
        body : {
            id_caja : id_caja,
            id_escuela : id_escuela,
            monto_final_real : monto_final_real
        }
    });  
};