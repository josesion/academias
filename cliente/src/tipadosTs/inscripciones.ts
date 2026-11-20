interface Paginacion {
    pagina?: number;
    limite?: number; 
}

export interface inscripcionData{
    id_plan                     : number ,
    
    dni_alumno?                 : number,
    email_alumno?               : string,
    fecha_inicio                : string,
    fecha_fin                   : string,
    monto                       : number | null,
    clases_asignadas_inscritas  : number,
    meses_asignados_inscritos   :number
}; 

export interface ResultInscripcion {
    id_plan : number,
    dni_alumno : number,
    id : number
};

export  interface DataPlan {
    id: number;
    descripcion : string;
    monto: number;
    clases: number;
    meses: number;
};

 export interface DataAlumno {
    Dni : string | undefined,
    Nombre : string , 
    Apellido : string,
    email : string
};

/**
 * Filtro para buscar alumnos en el formulario de inscripción.
 * Usa `email` como identificador principal; `dni` se mantiene como
 * fallback para compatibilidad con el backend.
 */
export interface FiltroAlumno extends Paginacion {
    dni?: string;
    email?: string;
    apellido: string;
    estado: string;
};

export interface FiltroPlan extends Paginacion {
    descripcion: string;
    estado: string;
};

export interface FiltroBusqueda {
    dni_alumno : string,
    email_alumno : string,
    nombre_alumno : string,
    fecha_desde : string,
    fecha_hasta : string,
    estado : "activos" | "vencidos"| "todos",
    pagina : number | 1 ,
    limit : number | 10
};


export interface InscripcionListadoResult {
  estado :string,  
  id_inscripcion: number;
  dni_alumno: number;
  email_alumno: string;
  nombre_completo: string;
  nombre_plan: string;
  clases_usadas: number;
  clases_totales: number;
  fecha_inicio: string; // Formato YYYY-MM-DD
  vigencia: string;     // Formato YYYY-MM-DD
  monto_pagado: string; // Viene como string de la DB
  metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | string;
};


export interface AnulacionInscripcion {
    id_cuenta: number;
    id_inscripcion: number;
    estadoInsc: 'activos' | 'vencidos' | 'anulados'; // Esto se llama Literal Type, para que no entre cualquier fruta
    monto: number;
    metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | string;
    descripcion: string;
}

/**
 * Filtro para el listado de inscripciones del dashboard.
 * "por_vencer" → ordenadas por vigencia ASC (las más cercanas arriba).
 * "ultimas" → ordenadas por fecha_inicio DESC (las más nuevas arriba).
 * "todos" → sin ordenamiento especial, las últimas 20 por defecto.
 */
export type FiltroInscripcionDashboard = "por_vencer" | "ultimas" | "todos";

/**
 * Inscripción tal como la devuelve el endpoint del dashboard
 * (GET /api/inscripciones_dashboard). Extende el listado estándar
 * con el campo calculado de días hasta vencimiento.
 */
export interface InscripcionDashboard {
    id_inscripcion: number;
    dni_alumno: number;
    nombre_completo: string;
    nombre_plan: string;
    fecha_inicio: string;     // YYYY-MM-DD
    vigencia: string;         // YYYY-MM-DD
    monto_pagado: string;
    estado: string;
    dias_hasta_vencimiento: number;
}