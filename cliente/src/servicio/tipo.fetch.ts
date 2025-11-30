import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../hooks/apiFetch";
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
            tipo        : data.tipo , 
            id_escuela  : data.id_escuela
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

        const rutaCompleta = `${PAGINA}api/mod_tipo_usu/${data.id}/${data.id_escuela}`;  
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

      const ruta = `${PAGINA}api/estado_tipo_usu/${data.id}/${data.id_escuela}/${data.estado}`;
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
        pagina : dataQuery.pagina.toString(),
        id_escuela : dataQuery.id_escuela.toString()
    };
 const rutaCompleta = `${PAGINA}api/lista_tipo_usu?${new URLSearchParams(parametrosConvertidos).toString()}`;  

 return await apiFetch( rutaCompleta , {
    method : "GET",
    signal : signal
 })

};