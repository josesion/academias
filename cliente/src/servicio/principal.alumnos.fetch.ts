import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import { type EscuelaData } from "../componentes/SeccionAlumnos/InfoEscuela/InfoEscuela";
import { type InscripcionActualData } from "../componentes/SeccionAlumnos/EstadoAlumno/EstadoPlan";
import { type  PlanEscuelaData } from "../componentes/SeccionAlumnos/TarjetasPlanes/TarjetasPlanes";
import { type HorarioClaseData } from "../componentes/SeccionAlumnos/Horarios/Horarios";


export interface EscuelaAlumnoRow {
  id_escuela: number;
  razon_social: string;
  direccion: string;
  celular: string; 
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  fecha_alta_escuela: string; 
  estado_en_escuela: string;
  /** Logo de la escuela (R2). `null` si la escuela no lo tiene cargado. */
  url_imagen: string | null;
  /** Inscripción ACTIVA del alumno en esa escuela. `null` si no tiene ninguna. */
  id_inscripcion: number | null;
  /** Estado de la inscripción activa. `null` si el alumno no tiene inscripción activa. */
  estado_inscripcion: "activos" | "suspendido" | "vencidos" | null;
  /** Nombre del plan contratado (personalizado por la escuela o el maestro). */
  descripcion_plan: string | null;
  /** Inicio de la inscripción activa ("YYYY-MM-DD"). */
  fecha_inicio_plan: string | null;
  /** Vencimiento de la inscripción activa ("YYYY-MM-DD"). */
  fecha_vencimiento_plan: string | null;
  /** Días que faltan para el vencimiento. Negativo si ya venció. */
  dias_restantes: number | null;
  /** Total de clases del plan: `clases_asignadas_inscritas * meses_asignados_inscritos`. */
  clases_plan: number | null;
  /** Clases a las que asistió (asistencias con `estado = 'presente'`). */
  clases_asistidas: number | null;
  /** Porcentaje de clases del plan que ya consumió. */
  porcentaje_clases_asistidas: number | null;
};

export interface ClaseHoyRow {
  id_escuela: number;
  hora: string;
  academia: string;
  tipoBaile: string;
  nivel: string;
  profesor: string;
};

export interface FlayerDataResult {
    id_flayer: number;
    id_escuela: number;
    titulo: string;
    descripcion: string;
    imagen_url: string;
};

export interface  RespuestaMetricasAlumnos {
     escuelas : EscuelaAlumnoRow[] | null ,
     clasesHoy : ClaseHoyRow[] |null  ,
     flayers  :  FlayerDataResult[] | null // por el momento 
};

export const alumnosEscuelas = async  (data :{ correo : string} )
:Promise<ApiResponse<RespuestaMetricasAlumnos>> =>{

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
 const ruta  = `${PAGINA}api/metricas_principal_alumno/${data.correo}`;  
 return await apiFetch( ruta, { 
    method : "GET"
 })
};


export interface ResultInfoEscuela {

    heroEscuela : EscuelaData | null ,
    flayer : FlayerDataResult[] | null ,
    inscripcion :InscripcionActualData | null ,
    planes :  PlanEscuelaData[] | null 

};

export const dataEscuela = async (data :{ correo : string, id_escuela : number})
:Promise<ApiResponse<ResultInfoEscuela>> =>{
  
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
    const ruta  = `${PAGINA}api/data_escuela_alumno/${data.correo}/${data.id_escuela}`; 
    
    return await apiFetch( ruta, { method : "GET"});    

};



export const horarioEscuela = async ( data : { id_escuela : number})
:Promise<ApiResponse<HorarioClaseData[]>> =>{
   
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
    const ruta  = `${PAGINA}api/horario_escuela/${data.id_escuela}`; 
    
    return await apiFetch( ruta, { method : "GET"});  

};