export interface AsistenciaFechas {
    estado     : "activos" | "inactivos"
};

export  interface dataAnular {
    modalAnular: boolean;
    id_cuenta? : number | null;
    idInscripcion?: number | null;
    metodo_pago : string,
    monto_pagado : string,
    carga: boolean  ;
    texto: string  ;
}

export interface DataDetalle {
    estado : string,
    nombre_completo: string ;
    dni_alumno: number ;
    clases_totales: number;
    clases_tomadas: number ;
    vigencia: string ;
    monto_pagado: string ;
    metodo_pago_descrip: string;     // con la descripcion chacheo el metodo de pago existente 
};

export interface ListadoCuentas {
    id_cuenta : number,
    nombre_cuenta :string
};

export interface RetornoListadoCuentas {
    id_cuenta : number,
    nombre_cuenta  : string,
    tipo_cuenta : string
};

export interface ResultadoClaseEnCruso {
    id_horario_en_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string
};

export interface ResultadoClaseProxima{
   id_horario_prox_clase : number,
   hora_inicio : string, 
   hora_fin : string,
   nombre_clase : string
};

export interface ResultErrorAsistencia {
    error : boolean | null,
    message : string | null,
    code : string | null
};

export type ResultadoClase_en_cursos =  ResultadoClaseEnCruso | ResultErrorAsistencia ;
export type ResultadoClase_proxima = ResultadoClaseProxima | ResultErrorAsistencia ; 

export interface ResulClases_curso_proxima{
    enCursoClase : ResultadoClaseEnCruso | ResultErrorAsistencia ,
    proximaClase : ResultadoClaseProxima | ResultErrorAsistencia 
};

export interface RegistroAsistencia extends AsistenciaFechas{
    dni_alumno : number ,
    id_inscripcion : number ,
    id_horario_clase : number,
};

export interface BusquedaAlumno extends AsistenciaFechas{
    dni_alumno : string ,
};


export interface ResultRegistroAsistencia{
  idAsistencia: number,
  clasesRestantes: number   
};


export type DataInscripcionVigente ={
    id_inscripcion : number,
    vencimiento : string,
    clases_restantes : number
};

type DataHorarioAsistencia = {
    id_horario_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string
};

type DataResultErrrorAsistencia = {
    error : boolean | null,
    message : string | null,
    code : string | null
};

export interface ResultDataAsistencia{
    dataHorario : DataHorarioAsistencia | DataResultErrrorAsistencia,
    dataInscripcion : DataInscripcionVigente | DataResultErrrorAsistencia
}

export interface DataAsistencia{
     dni_alumno : string,
     estado : "activos" | "inactivos",
};

export interface AsistenciaInscripcionRow {
  fecha: string;
  id_horario_clase: number;
  dia_semana: string;
  hora: string;
  tipo_clase: string;
  nivel: string;
  profesor: string;
};

export interface InfoAlumno {
  nombre_completo: string;
  dni_alumno: number;
  id_inscripcion: number;
  clases_restantes: number;
  vencimiento: string;
  estado: string;
  plan: string;
}

export interface PlantillaAsistencia {
  id_plantilla: number;
  nombre: string;
  fecha_creacion: string;
  alumnos: number[];
}

/** Opción del selector de clases de la asistencia rápida (spec 043). */
export interface ClaseOpcion {
  id: number;
  nombre: string;
}

/** Opción del selector de plantillas de la asistencia rápida (spec 043). */
export interface PlantillaOpcion {
  id: number;
  nombre: string;
  etiqueta: string;
}

/** Acción en curso en el modal de asistencia rápida (spec 043). */
export type AccionAsistenciaRapida =
  | "consulta"
  | "registro"
  | "plantilla"
  | "agregarAlumno"
  | "quitarAlumno"
  | "registroGrupo"
  | null;

/** Situación de un alumno frente a su inscripción (spec 043). */
export type SituacionAlumno =
  | "vigente"
  | "por_vencer"
  | "vencido"
  | "sin_clases"
  | "inactivo";