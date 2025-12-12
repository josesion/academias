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
    monto                       : number,
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

}