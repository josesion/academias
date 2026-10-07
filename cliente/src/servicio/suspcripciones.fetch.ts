import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


/**
 * Lo que el front manda al dar de alta una suscripción.
 * Solo los IDs: las fechas (hoy y hoy + 1 mes) y el estado ("activo")
 * los calcula el server, que los devuelve en `SuscripcionDatos`.
 */
export interface SuscripcionInput {
    id_escuela: number;
    id_plan_saas: number;
}


export interface SuscripcionDatos {
    id_escuela: number;
    id_plan_saas: number;
    fecha_inscripcion: string;   // "YYYY-MM-DD"
    fecha_vencimiento: string;   // "YYYY-MM-DD"
}

/**
 * Alta de una suscripción (POST /api/post_suspcripcion).
 * El server responde `SUSCRIPCION_OK` con las fechas que calculó él,
 * `SUSCRIPCION_ACTIVA` si esa academia ya tiene un plan activo,
 * o `NOT_AUTHENTICATED` si no hay sesión.
 *
 * @param data - IDs de la academia y del plan elegidos en el formulario.
 * @returns Respuesta estandarizada (`error`, `message`, `code`, `data`).
 */
export const postSusp = async( data  : SuscripcionInput )
:Promise<ApiResponse<SuscripcionDatos>> =>{

    const { id_escuela , id_plan_saas } = data;

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


    const ruta  = `${PAGINA}api/post_suspcripcion`;
    return await apiFetch( ruta , {
        method : "POST",
        body : {
            id_escuela,
            id_plan_saas
        }
    });
}



export interface FiltrosSuscripcionesInputs {
    razon_social?: string;
    id_plan_saas?: string;
    fecha_inscripcion?: string;
    estado?: string;
    limit?: number;
    pagina: number; // Como la casteás directo con Number(), queda requerida (o ponela con ? si puede venir undefined)
}

export interface SuscripcionEscuelaDto {// esta es la respuesta del fetch
    id_suscripcion: number;
    id_escuela: number;
    razon_social: string;
    id_plan_saas: number;
    tipo_plan: string;
    descripcion_plan: string;
    fecha_inscripcion: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    fecha_vencimiento: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    estado_suscripcion: string;
};

// fetch del listado
export const getEscuelas = async( data : FiltrosSuscripcionesInputs )
:Promise<ApiResponse<SuscripcionEscuelaDto[]>> =>{

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
        razon_social      : data.razon_social      ?? "",
        id_plan_saas      : data.id_plan_saas      ?? "",
        fecha_inscripcion : data.fecha_inscripcion ?? "",
        estado            : data.estado            ?? "",
        pagina            : String(data.pagina),
        limit             : data.limit !== undefined ? String(data.limit) : ""
    };

    const ruta = `${PAGINA}api/lista_susp?${new URLSearchParams(parametrosQuery as Record<string, string>).toString()}`;
    return await apiFetch( ruta , {
        method : "GET"
    });
}

export interface EscuelaSelect {
    id_escuela: number;
    razon_social: string;
};

export interface PlanSaasRow {
    id_plan: number;
    descripcion: string;
}

export interface EscPlanDTO {
    escuelas: EscuelaSelect[];
    planes_saas: PlanSaasRow[];
};


export const getEscPlanes = async ()
:Promise<ApiResponse<EscPlanDTO>> =>{

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
    const ruta = `${PAGINA}api/esc_plan_list`;
    return await apiFetch( ruta , {
        method : "GET"
    });    
    
}

export interface SuscripcionEstadoDto {
    id_suscripcion: number;
    estado: string;
};

export const putEstadoSuspc = async ( id_susp : number)
:Promise<ApiResponse<SuscripcionEstadoDto>> =>{

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
    const ruta = `${PAGINA}api/anular_susp/${id_susp}`;
    return await apiFetch( ruta , {
        method : "PUT"
    });    
    
}

export interface MetricasSimples {
    suscripciones_por_vencer: number;
    suscripciones_vencidas: number;
    total_mes: number;
    suscripciones_vigentes: number;
};

export const metricasSuspcripcion = async ( )
:Promise<ApiResponse<MetricasSimples >> =>{

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
    const ruta = `${PAGINA}api/metricas_simples`;
    return await apiFetch( ruta , {
        method : "GET"
    });    
    
}