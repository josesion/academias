interface Paginacion {
    pagina?: number;
    limite?: number; 
}

export interface inscripcionData{
    id_plan                     : number ,
    id_escuela                  : number,
    dni_alumno                  : number,
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
    Dni : string ,
    Nombre : string , 
    Apellido : string
};

export interface FiltroAlumno extends Paginacion {
    dni: string;
    estado: string;
    id_escuela: number;
};

export interface FiltroPlan extends Paginacion {
    descripcion: string;
    estado: string;
    id_escuela: number;

};

export interface FiltroBusqueda {
    dni_alumno : string,
    nombre_alumno : string,
    fecha_desde : string,
    fecha_hasta : string,
    id_escuela : number,
    estado : "activos" | "vencidos"| "todos",
    pagina : number | 1 ,
    limit : number | 10
};


export interface InscripcionListadoResult {
  id_inscripcion: number;
  dni_alumno: number;
  nombre_completo: string;
  nombre_plan: string;
  clases_usadas: number;
  clases_totales: number;
  fecha_inicio: string; // Formato YYYY-MM-DD
  vigencia: string;     // Formato YYYY-MM-DD
  monto_pagado: string; // Viene como string de la DB
  metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | string;
};

