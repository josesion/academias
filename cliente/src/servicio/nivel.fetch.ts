import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


// Seccion de tipados Alumnos
import type * as TipadoNivel from "../tipadosTs/nivel";


export const registroNivel = async( data : TipadoNivel.RegistroNivel)
 : Promise<ApiResponse<TipadoNivel.ResultRegistroNivel>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }
     
     const ruta  = `${PAGINA}api/nivel_usu_alta`; 
     return await apiFetch( ruta ,{
        method : "POST",
        body   : {
            nivel           : data.nivel,
        }
     });   
};

export const modNivel = async( data : TipadoNivel.ModNivel ) 
: Promise<ApiResponse<{nivel :string}>> =>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const ruta = `${PAGINA}api/nivel_usu_modificar/${data.id}`;
    return await apiFetch( ruta , {
        method : "PUT",
        body   : {
            nivel : data.nivel
        }
    });
};

export const estadoNivel = async( data : TipadoNivel.estadoNivel ) 
: Promise<ApiResponse<{nivel :string}>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const ruta = `${PAGINA}api/nivel_usu_estado/${data.id}/${data.estado}`;
    return await apiFetch( ruta , {
        method : "PUT",
        body   : {
            nivel : data.nivel
        }
    });
};


export const listadoNivel = async( dataQuery : TipadoNivel.ListadoNivel & TipadoNivel.Paginacion, signal? : AbortSignal )
: Promise<ApiResponse<TipadoNivel.RegistroNivel>> =>{
    
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const parametrosConvertidos = {
        nivel : dataQuery.nivel, 
        estado : dataQuery.estado,
        limite : dataQuery.limite.toString(),
        pagina : dataQuery.pagina.toString()
    };

  const rutaCompleta = `${PAGINA}api/listaNivel_usu?${new URLSearchParams(parametrosConvertidos).toString()}`;  

  return await apiFetch( rutaCompleta , {
    method : "GET",
    signal : signal
  });
};

export const listadoNivelSinPaginacion = async( dataQuery : TipadoNivel.ListadoNivel , signal? : AbortSignal ) 
: Promise<ApiResponse<TipadoNivel.ResultRegistroNivel>>=> {
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
        nivel : dataQuery.nivel || "%" , 
        estado : dataQuery.estado || "activos"
    };

    const rutaCompleta = `${PAGINA}api/listaNivel_usu_sin_pag?${new URLSearchParams(parametrosConvertidos).toString()}`;
    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal : signal
    });
};