import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import type * as TipadoProfesores from "../tipadosTs/profesores";


export const altaProfesor = async( data : TipadoProfesores.RegistroProfesores ) 
   :Promise<ApiResponse<TipadoProfesores.RegistroProfesores>> =>{
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

    const { dni , nombre , apellido , celular , id_escuela } = data;
 
    const ruta  = `${PAGINA}api/registro_profesor`;
    return await apiFetch( ruta , {
        method : "POST",
        body :{
            dni         : dni,
            nombre      : nombre,
            apellido    : apellido,
            celular     : celular,
            id_escuela  : id_escuela
        }
    });
};


export const modProfesor = async( data : TipadoProfesores.ModProfesores )
 : Promise<ApiResponse<TipadoProfesores.ModProfesores>> => {
    
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
   
    const { dni , id_escuela , estado } = data;

    const ruta  = `${PAGINA}api/usu_estado_profesor/${dni}/${id_escuela}/${estado}`;
   

    return await apiFetch( ruta , {
        method : "PUT",
    });
};

export const listadoProfesores = async(
    data: TipadoProfesores.ListadoProfesores,
    signal?: AbortSignal
): Promise<ApiResponse<TipadoProfesores.ProfesoresData>> => {

    const verificarUser = await verificarAutenticacion();
    if (!verificarUser.autenticado) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const parametrosConvertidos = {
            estado: data.estado || "activos",
            escuela: data.id_escuela.toString(),
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
