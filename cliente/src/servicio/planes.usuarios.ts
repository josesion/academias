import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../hooks/apiFetch";

import * as TipadoPlanesUsuarios from "../tipadosTs/planes.usuarios";


export const registroPlanesUsuario = async ( parametros : TipadoPlanesUsuarios.CrearPlanesUsuarios) 
 : Promise<ApiResponse<TipadoPlanesUsuarios.PlanesUsuarioResponse>> =>{

   const rutaCompleta = `${PAGINA}api/usu_planes`;  
   return await apiFetch( rutaCompleta , {
        method : "POST",
        body : {
                descripcion     : parametros.descripcion,
                cantidad_clases : parametros.cantidad_clases,
                cantidad_meses  : parametros.cantidad_meses,
                monto           : parametros.monto,

                fecha_creacion  : parametros.fecha_creacion,
                estado          : parametros.estado,
                id_escuela      : parametros.id_escuela
        }
   });

};


export const eliminarPlanUsuario = async ( parametros : TipadoPlanesUsuarios.EliminarPlanUsuario) 
 : Promise<ApiResponse<TipadoPlanesUsuarios.EliminarPlanUsuariosResponse>> =>{

    const rutaCompleta = `${PAGINA}api/usu_estado_planes/${parametros.id}/${parametros.id_escuela}/${parametros.estado}`;

    return await apiFetch( rutaCompleta , { 
        method : "PUT"
    });
};


export const  modPlanUsuario= async ( parametros : TipadoPlanesUsuarios.ModPlanesUsuarios)
 : Promise<ApiResponse<TipadoPlanesUsuarios.ModPlanesUsuariosResult>> =>{
   
 
    const rutaCompleta = `${PAGINA}api/usu_mod_planes/${parametros.id}/${parametros.id_escuela}`;

    return await apiFetch( rutaCompleta , {
        method :  "PUT",
        body   : {
                descripcion     : parametros.descripcion,
                cantidad_clases : parametros.cantidad_clases,
                cantidad_meses  : parametros.cantidad_meses,
                monto           : parametros.monto
        }
    });

};


export const listadoPlanesUsuarios = async( parametros : TipadoPlanesUsuarios.listadoPlanUsuario & TipadoPlanesUsuarios.Paginacion,
    signal? : AbortSignal 
 ) : Promise<ApiResponse<TipadoPlanesUsuarios.PlanesUsuarioResponse[]>> => {
       
        const parametrosConvertidos = {
            descripcion : parametros.descripcion,
            estado      : parametros.estado,

            limit : parametros.limite.toString(),
            pagina : parametros.pagina.toString(),
            escuela : parametros.id_escuela.toString()
       };

const rutaCompleta = `${PAGINA}api/usu_listado_planes?${new URLSearchParams(parametrosConvertidos).toString()}`;
   
    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal: signal
    });
 
};