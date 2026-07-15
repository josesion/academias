import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

export  interface ResultTarjeta{
    total_activos: number,
    nuevos_este_mes:  number,
    porcentaje_nuevos:  number,
    vencen_proximos:  number,
    vencidos_este_mes:  number, 
    total_caja : number,      
};



export const metricasTajertas = async ()
:Promise<ApiResponse<ResultTarjeta>> =>{

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
   
    const ruta  = `${PAGINA}api/metricas_tarjetas`;  

    return apiFetch( ruta , { method : "GET" } );
};


export interface ResultClase {
    nombre_clase: string,
    horario: string,
    nombre_profesor: string,
    id_clase : number
};

export const metricasClase = async ()
:Promise<ApiResponse<ResultClase>> =>{

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
   
    const ruta  = `${PAGINA}api/metricas_clase`;  

    return apiFetch( ruta , { method : "GET" } );
};



export interface ResultAsistencia {
   nombre : string , apellido : string , estado : string 
};

export const metricasAsistencia = async ()
:Promise<ApiResponse<ResultAsistencia>> =>{

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
   
    const ruta  = `${PAGINA}api/metrica_asistencia`;  

    return apiFetch( ruta , { method : "GET" } );
};