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
    nombre_clase : string,
    sala?: string
};

export interface ResultadoClaseProxima{
   id_horario_prox_clase : number,
   hora_inicio : string, 
   hora_fin : string,
   nombre_clase : string,
   sala?: string
};

export interface ResultErrorAsistencia {
    error : boolean | null,
    message : string | null,
    code : string | null
};

export type ResultadoClase_en_cursos =  ResultadoClaseEnCruso[] | ResultErrorAsistencia ;
export type ResultadoClase_proxima = ResultadoClaseProxima[] | ResultErrorAsistencia ; 

/**
 * `enCursoClase` y `proximaClase` son arrays porque puede haber múltiples
 * clases simultáneas en salas distintas (kiosko).
 */
export interface ResulClases_curso_proxima{
    enCursoClase : ResultadoClaseEnCruso[] | ResultErrorAsistencia ,
    proximaClase : ResultadoClaseProxima[] | ResultErrorAsistencia 
};

/**
 * Datos para registrar una asistencia en el kiosco.
 * `pin_asistencia` identifica al alumno en la búsqueda.
 * `dni_alumno` se obtiene al buscar por PIN y se envía al registrar
 * para que la tabla `asistencias` pueda guardar el DNI correctamente.
 */
export interface RegistroAsistencia extends AsistenciaFechas{
    pin_asistencia : string ,
    dni_alumno : number | null,
    id_inscripcion : number ,
    id_horario_clase : number,
};

/**
 * Filtro de búsqueda de alumno en el kiosco por PIN.
 */
export interface BusquedaAlumno extends AsistenciaFechas{
    pin_asistencia : string ,
};


export interface ResultRegistroAsistencia{
  idAsistencia: number,
  clasesRestantes: number   
};


export type DataInscripcionVigente ={
    id_inscripcion : number,
    vencimiento : string,
    clases_restantes : number,
    dni_alumno : number | null
};

export type DataHorarioAsistencia = {
    id_horario_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string,
    sala?: string
};

export type DataResultErrrorAsistencia = {
    error : boolean | null,
    message : string | null,
    code : string | null
};

/**
 * `dataHorario` es ahora un array porque puede haber múltiples clases
 * en curso simultáneas en salas distintas (kiosko).
 */
export interface ResultDataAsistencia{
    dataHorario : DataHorarioAsistencia[] | DataResultErrrorAsistencia,
    dataInscripcion : DataInscripcionVigente | DataResultErrrorAsistencia
}

/**
 * Datos para buscar un alumno en el kiosco de asistencia.
 * Se usa el PIN de 4 dígitos en lugar del DNI.
 */
export interface DataAsistencia{
     pin_asistencia : string,
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
  sala?: string;
};

export interface InfoAlumno {
  nombre_completo: string;
  dni_alumno: number | null;
  email_alumno: string;
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
  sala?: string;
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