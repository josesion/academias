import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";

import type * as TipadoTipoCuentas from "../tipadosTs/tipo.cuents";


export const altaTipoCuenta = async( data : TipadoTipoCuentas.TipoCuentas) 
: Promise<ApiResponse<TipadoTipoCuentas.ResultTipoCuentasAlta>> => {
   const ruta =  `${PAGINA}api/alta_cuenta`;   

    return await apiFetch (  ruta , {
        method : "POST",
        body : {
            nombre_cuenta : data.nombre_cuenta,
            tipo_cuenta : data.tipo_cuenta
        }
    });

};

export const modTipoCuenta = async( data : TipadoTipoCuentas.TipoCuentasMod) 
: Promise<ApiResponse<TipadoTipoCuentas.ResultTipoCuentaMod>>=> {
    const rutaCompleta = `${PAGINA}api/mod_cuenta/${data.id_cuenta}`;
    console.log(rutaCompleta)
    return await apiFetch( rutaCompleta, {
        method : "PUT",
        body : {
              nuevo_nombre_cuenta  : data.nombre_cuenta,
              nuevo_tipo_cuenta : data.tipo_cuenta
        }
    });

};

export const estadoTipoCuenta = async ( data : TipadoTipoCuentas.EstadoTipoCuenta)
: Promise<ApiResponse<TipadoTipoCuentas.ResultEstadoTipoCuenta>> => {
    const rutaCompleta = `${PAGINA}api/estado_cuenta/${data.id_cuenta}/${data.estado}`;  

    return await apiFetch( rutaCompleta, {
        method : "PUT"
    });
};

export const listaTipoCuentas = async ( data : TipadoTipoCuentas.ListaTipoCuentas , signal?: AbortSignal)
: Promise<ApiResponse<TipadoTipoCuentas.ResultListaTipoCuentas[]>> => {
    const parametrosConvertidos = {

        nombre_cuenta : data.nombre_cuenta,
        tipo_cuenta : data.tipo_cuenta,
        estado : data.estado,
        limit : data.limite.toString(),
        pagina : data.pagina.toString()
    };  



   const rutaCompleta = `${PAGINA}api/list_tipos_cuentas?${new URLSearchParams(parametrosConvertidos).toString()}`;  
 
   return await apiFetch( rutaCompleta, {
        method : "GET",
        signal : signal 
   });

};