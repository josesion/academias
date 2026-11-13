import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";

import type * as TipadoProfesores from "../tipadosTs/profesores";


export const altaProfesor = async( data : TipadoProfesores.RegistroProfesores ) 
   :Promise<ApiResponse<TipadoProfesores.RegistroProfesores>> =>{
    const { dni , nombre , apellido , celular  } = data;
 
    const ruta  = `${PAGINA}api/registro_profesor`;
    return await apiFetch( ruta , {
        method : "POST",
        body :{
            dni         : dni,
            nombre      : nombre,
            apellido    : apellido,
            celular     : celular,
        }
    });
};


export const modProfesor = async( data : TipadoProfesores.ModProfesores )
: Promise<ApiResponse<TipadoProfesores.ModProfesores>> => {
    const { dni , nombre , apellido , celular } = data;

    const ruta  = `${PAGINA}api/usu_mod_profesor/${dni}`;
    return await apiFetch( ruta , {
        method : "PUT",
        body :{
            nombre      : nombre,
            apellido    : apellido,
            celular     : celular,
        }
    });
};

export const bajaProfesor = async( data : TipadoProfesores.BajaProfesores ) => {
    const { dni , estado } = data;

    const ruta  = `${PAGINA}api/usu_estado_profesor/${dni}/${estado}`;
   

    return await apiFetch( ruta , {
        method : "PUT",
    });
};

export const listadoProfesores = async(
    data: TipadoProfesores.ListadoProfesores,
    signal?: AbortSignal
): Promise<ApiResponse<TipadoProfesores.ProfesoresData>> => {
    const parametrosConvertidos = {
            estado: data.estado || "activos",
            dni: data.dni || "%",
            apellido: data.apellido || "%",
            limit: data.limite.toString() || "10",
            pagina: data.pagina.toString() || "1"
    };

    const rutaCompleta = `${PAGINA}api/usu_listado_profesores?${new URLSearchParams(parametrosConvertidos as Record<string, string>).toString()}`;

   

    return await apiFetch(rutaCompleta, {
        method: "GET",
        signal
    });
};


export const listadoProfesoresSinPag = async( data : TipadoProfesores.ListadoProfeSinPag ,signal?: AbortSignal)
: Promise<ApiResponse<TipadoProfesores.ProfesoresDataResponse>> => {
    const dataConvertida = {
        dni: data.dni ,
        estado: data.estado || "activos",
    }

    const rutaCompleta = `${PAGINA}api/usu_listado_profesores_sin_paginacion?${new URLSearchParams(dataConvertida as Record<string, string>).toString()}`;

    return await apiFetch( rutaCompleta , {
        method : "GET",
        signal : signal
    });


};
