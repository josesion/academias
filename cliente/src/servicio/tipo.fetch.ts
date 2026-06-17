import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import * as tipadoTipoUsuarios from "../tipadosTs/tipo";

export const registroTipo = async( data : tipadoTipoUsuarios.altaTipo)
: Promise<ApiResponse<{tipo : string}>> => {

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

    const rutaCompleta = `${PAGINA}api/alta_tipo_usu`;  
    return await apiFetch( rutaCompleta , {
        method : "POST" ,
        body   :{
            tipo        : data.tipo 
        }
    });
};

export const modTipo =async( data : tipadoTipoUsuarios.modTipo)
: Promise<ApiResponse<{ id: number , tipo : string }>> =>{

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

        const rutaCompleta = `${PAGINA}api/mod_tipo_usu/${data.id}`;  
        return await apiFetch( rutaCompleta , {
            method : "PUT",
            body   :{
                tipo : data.tipo
            }
        });

};

export const estadoTipo = async( data : tipadoTipoUsuarios.estadoTipo)
: Promise<ApiResponse<{ id : Number }>> =>{

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

      const ruta = `${PAGINA}api/estado_tipo_usu/${data.id}/${data.estado}`;
      return await apiFetch( ruta , {
        method : "PUT"
      });
};


export const listado =async( dataQuery : tipadoTipoUsuarios.estadoTipo & tipadoTipoUsuarios.Paginacion ,  signal? : AbortSignal)
: Promise<ApiResponse<{ id: number , tipo : String }>> =>{

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
        tipo : dataQuery.tipo, 
        estado : dataQuery.estado,
        limite : dataQuery.limite.toString(),
        pagina : dataQuery.pagina.toString()
    };
 const rutaCompleta = `${PAGINA}api/lista_tipo_usu?${new URLSearchParams(parametrosConvertidos).toString()}`;  

 return await apiFetch( rutaCompleta , {
    method : "GET",
    signal : signal
 })

};


export const listadoTipoSinPaginacion =async( dataQuery : tipadoTipoUsuarios.listadoTipoSinPaginacion ,  signal? : AbortSignal)
: Promise<ApiResponse<{ id : number , tipo :string}>> =>{
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
        nivel : dataQuery.tipo || "", 
        estado : dataQuery.estado  || "activos"
    };    

    const rutaCompleta = `${PAGINA}api/lista_tipo_usu_sin_pag?${new URLSearchParams(parametrosConvertidos as Record<string, string>).toString()}`;

    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal : signal
     });
}