import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


import type * as TipadoHorario from "../tipadosTs/horario";


export const calendarioEscuela = async( 
    data : TipadoHorario.Calendario ,
    signal? : AbortSignal
 ) : Promise<ApiResponse<TipadoHorario.ResultCalendarioHorario>>=>{
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

    const parametrosQuery = {
        estado: data.estado || "activos",
        id_escuela: data.id_escuela.toString(),
    };

    const ruta  = `${PAGINA}api/lista_horario?${new URLSearchParams(parametrosQuery as Record<string, string>).toString()}`;      
    return await apiFetch( ruta , {
        method : "GET",
        signal : signal
    });

};

export const altaHorario = async(
    data : TipadoHorario.DataHorario
) : Promise<ApiResponse<TipadoHorario.DataHorario>> =>{
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

    const ruta  = `${PAGINA}api/alta_horario`;  
    return await apiFetch( ruta , {
        method : "POST",
        body   :{
            id_escuela : data.id_escuela,
            dni_profesor : data.dni_profesor,
            id_nivel : data.id_nivel,
            id_tipo_clase  : data.id_tipo_clase,
            hora_inicio : data.hora_inicio ,
            hora_fin   : data.hora_fin ,
            dia_semana : data.dia_semana,
            fecha_creacion : data.fecha_creacion,
            estado : data.estado           
        }
    });

};

export const modHorario = async ( 
    data : TipadoHorario.ModHorario, signal? : AbortSignal)
    : Promise<ApiResponse<TipadoHorario.ModHorario>> =>{

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
 const ruta  = `${PAGINA}api/mod_horario`;  
 return await apiFetch( ruta , {
    method : "PUT",
    body : {
        id_escuela : data.id_escuela,
        dni_profesor : data.dni_profesor,
        id_nivel : data.id_nivel,
        id_tipo_clase : data.id_tipo_clase,
        id : data.id
    },
    signal : signal 
 });

};

export const eliminarHorario = async( 
    data : TipadoHorario.EliminarHorario,
    signal? : AbortSignal
)
: Promise<ApiResponse<TipadoHorario.EliminarHorario>> =>{
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
 const ruta  = `${PAGINA}api/eliminar_horario`;   
 return await apiFetch( ruta, {
    method : "DELETE",
    body   : {
        id_escuela : data.id_escuela,
        id : data.id,
        estado : data.estado,
        vigente : data.vigente       
    },
    signal : signal
 })   
};