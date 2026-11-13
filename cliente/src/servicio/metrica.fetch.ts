import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";


export  interface ResultTarjeta{
    total_activos: number,
    nuevos_este_mes:  number,
    porcentaje_nuevos:  number,
    vencen_proximos:  number,
    vencidos_este_mes:  number, 
    total_caja : number,      
    porcentaje_activos?: number,
    porcentaje_nuevos_real?: number,
    porcentaje_vencen_proximos?: number,
    porcentaje_vencidos?: number,
};



export const metricasTajertas = async ( signal? : AbortSignal)
:Promise<ApiResponse<ResultTarjeta>> =>{
    const ruta  = `${PAGINA}api/metricas_tarjetas`;  

    return apiFetch( ruta , { method : "GET" , signal : signal } );
};


export interface ResultClase {
    nombre_clase: string,
    horario: string,
    nombre_profesor: string,
    id_clase : number
};

export const metricasClase = async ()
:Promise<ApiResponse<ResultClase>> =>{
    const ruta  = `${PAGINA}api/metricas_clase`;  
    return apiFetch( ruta , { method : "GET" } );
};



export interface ResultAsistencia {
   nombre : string , apellido : string , estado :  "presente" | "Tardanza" | "Ausente";
};

export const metricasAsistencia = async (_data?: unknown, signal?: AbortSignal)
:Promise<ApiResponse<ResultAsistencia>> =>{
    const ruta  = `${PAGINA}api/metrica_asistencia`;  
    
    return apiFetch( ruta , { method : "GET" , signal : signal } );
};


export interface VencimientoEscuela {
  id_escuela: number;
  razon_social: string;
  fecha_vencimiento: string; 
}

export const fechaVencimientoPlan =async ()
:Promise<ApiResponse<VencimientoEscuela>> =>{
    const ruta  = `${PAGINA}api/vencimiento_plan_saas`;  

    return apiFetch( ruta , { method : "GET" } );

}