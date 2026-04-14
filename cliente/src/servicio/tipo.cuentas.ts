import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


import type * as TipadoTipoCuentas from "../tipadosTs/tipo.cuents";


export const altaTipoCuenta = async( data : TipadoTipoCuentas.TipoCuentas) 
: Promise<ApiResponse<TipadoTipoCuentas.ResultTipoCuentasAlta>> => {
   
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

   const ruta =  `${PAGINA}api/alta_cuenta`;   

    return await apiFetch (  ruta , {
        method : "POST",
        body : {
            id_escuela : data.id_escuela,
            nombre_cuenta : data.nombre_cuenta,
            tipo_cuenta : data.tipo_cuenta
        }
    });

};

export const modTipoCuenta = async( data : TipadoTipoCuentas.TipoCuentasMod) 
: Promise<ApiResponse<TipadoTipoCuentas.ResultTipoCuentaMod>>=> {
  
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
    
    const rutaCompleta = `${PAGINA}api/mod_cuenta/${data.id_cuenta}/${data.id_escuela}`;     
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
    
    const rutaCompleta = `${PAGINA}api/estado_cuenta/${data.id_cuenta}/${data.id_escuela}/${data.estado}`;  

    return await apiFetch( rutaCompleta, {
        method : "PUT"
    });
};

export const listaTipoCuentas = async ( data : TipadoTipoCuentas.ListaTipoCuentas , signal?: AbortSignal)
: Promise<ApiResponse<TipadoTipoCuentas.ResultListaTipoCuentas[]>> => {
   
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

        nombre_cuenta : data.nombre_cuenta,
        tipo_cuenta : data.tipo_cuenta,
        estado : data.estado,
        
        id_escuela : data.id_escuela.toString(),
        limit : data.limite.toString(),
        pagina : data.pagina.toString()
    };  

   const rutaCompleta = `${PAGINA}api/list_tipos_cuentas?${new URLSearchParams(parametrosConvertidos).toString()}`;  
 
   return await apiFetch( rutaCompleta, {
        method : "GET",
        signal : signal 
   });

};