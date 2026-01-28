import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import type * as TipadoCategoriaCaja from "../tipadosTs/categorias.cajas.typado"

export const altaCategoriaCaja = async (
    data : TipadoCategoriaCaja.DataCategoria
) : Promise<ApiResponse<TipadoCategoriaCaja.DataCategoria>> =>{
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

    const ruta  = `${PAGINA}api/categoria_caja`;  
    return await apiFetch( ruta , {
        method : "POST",
        body  : {
            nombre_categoria : data.nombre_categoria,
            tipo_movimiento  : data.tipo_movimiento,
            estado           : "activos", 
            id_escuela       : data.id_escuela    
        }
    });
};

export const modCategoriaCaja = async (
    data : TipadoCategoriaCaja.ModCategoriaCaja
) : Promise<ApiResponse<{id_categoria : number}>> => {
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

   const { id_categoria, nombre_categoria, tipo_movimiento, id_escuela} = data; 

   const ruta = `${PAGINA}api/mod_categoria_caja/${id_categoria}/${nombre_categoria}/${tipo_movimiento}/activos/${id_escuela}`;
  
   return await apiFetch( ruta ,{
    method : "PUT"
   });  
};

export const bajaCategoriaCaja = async(
    data : TipadoCategoriaCaja.BajaCategoriaCaja
) : Promise<ApiResponse<TipadoCategoriaCaja.BajaCategoriaCaja>> =>{
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
    const {id_categoria, estado, id_escuela} = data;
    const ruta = `${PAGINA}api/baja_categoria_caja/${id_categoria}/${estado}/${id_escuela}`;

    return await apiFetch( ruta , {
        method : "DELETE"
    });

};

export const listadoCategoriaCaja = async(
    data : TipadoCategoriaCaja.ListadoData,
    signal? : AbortSignal
) : Promise<ApiResponse<TipadoCategoriaCaja.ResultListadoCategoriaCaja[]>> => {
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
        categoria : data.nombre_categoria,
        tipo : data.tipo_movimiento,
        estado : data.estado,

        id_escuela : data.id_escuela.toString(),
        limite : data.limite.toString(),
        pagina : data.pagina.toString(),

  };

  const rutaCompleta = `${PAGINA}api/lista_categoria_caja?${new URLSearchParams(parametrosConvertidos).toString()}`;  
  return await apiFetch( rutaCompleta , {
    method : "GET" ,
    signal : signal
  })

};