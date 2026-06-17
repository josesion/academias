import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
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
            id_cuenta : data.id_cuenta,
        
            monto : data.monto,
            descripcion : data.descripcion,
            referencia_id : data.referencia_id
        }
    } ); 
};


export const obtenerIdCaja = async ( )
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
    const ruta = `${PAGINA}api/id_caja`;
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
    const {id_caja } = data ;
  
    const ruta = `${PAGINA}api/metricas_caja/${id_caja}`;   
    return await apiFetch(ruta, {
        method : "GET"
    });
    
};

export const abrirCaja = async (data : TipadoCaja.AperturaCajaInputs ,)
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
    const {  estado  , detalle } = data ;
    const ruta = `${PAGINA}api/caja_apertura`;  
    return await apiFetch( ruta,  {
        method : "POST",
        body : {
            estado     : estado,
            detalle : detalle
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
    const { id_caja , 
            monto_sistema, 
            monto_final_real, diferencia_total,
            observaciones_cierre, arqueo_detalle
        } = data ; 

    const ruta = `${PAGINA}api/cierre_caja`;

    return await apiFetch( ruta , {
        method : "POST",
        body : {
            id_caja : id_caja,
            monto_final_real : monto_final_real,
            monto_sistema : monto_sistema,
            diferencia_total : diferencia_total,
            arqueo_detalle : arqueo_detalle,
            observaciones_cierre : observaciones_cierre
        }
    });  
};

export const listadoCategoriaCaja = async ( data : TipadoCaja.listadoCategoriaCaja) 
: Promise<ApiResponse<TipadoCaja.CategoríaCaja[]>> =>{
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
    const { tipo , estado}  = data; 
    const ruta = `${PAGINA}api/lista_categoria_caja_tipos/${tipo}/${estado}`;
    return apiFetch( ruta , {
        method : "GET"
    });
};


export const movimientoCajaDetalle = async ( data : TipadoCaja.DetalleMovimientoCaja, signal? : AbortSignal )
: Promise<ApiResponse<TipadoCaja.DetalleCajaMovimientoResult[]>> => {
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
   
    const parametrosConvertidos = {
        id_caja : data.id_caja.toString(),
        limite  : data.limite.toString(),
        offset  : data.offset.toString()
    };
   const rutaCompleta = `${PAGINA}api/movimientos_caja?${new URLSearchParams(parametrosConvertidos).toString()}`;
 
   return await apiFetch( rutaCompleta, {
        method : "GET",
        signal : signal
   });
};

export const listadoTipoCuentas = async ( data : TipadoCaja.DataTipoCuenta)
: Promise<ApiResponse<TipadoCaja.ListadoTipoCuentas[]>> => {

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
    const { estado } = data ;

    const ruta = `${PAGINA}api/lista_tipos_cuentas/${estado}`;
    
    return await apiFetch( ruta , {
       method : "GET"  
    });
 
};

export const metricasPanelPrincipal = async (data : TipadoCaja.CierreCajaData) =>{
    const {id_caja  } = data;
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
    
    const ruta = `${PAGINA}api/metricas_panel/${id_caja}`;   

    return apiFetch( ruta , {
        method : "GET"
    });
};