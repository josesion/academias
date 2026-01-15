export interface AsistenciaFechas {
    id_escuela : number,
    estado     : "activos" | "inactivos"
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
     id_escuela : number,
     dni_alumno : string,
     estado : "activos" | "inactivos",
};