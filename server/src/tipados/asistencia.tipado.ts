

export interface ResultadoClaseEnCruso {
    id_horario_en_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string,
    sala : string
}

export interface ResultadoClaseProxima{
   id_horario_prox_clase : number,
   hora_inicio : string, 
   hora_fin : string,
   nombre_clase : string,
   sala : string
}

export interface ResultErrorAsistencia {
    error : boolean | null,
    message : string | null,
    code : string | null
}


/**
 * `enCursoClase` y `proximaClase` son arrays porque puede haber múltiples
 * clases simultáneas en salas distintas (kiosko).
 */
export interface ResulClases_curso_proxima{
    enCursoClase : ResultadoClaseEnCruso[] | ResultErrorAsistencia ,
    proximaClase : ResultadoClaseProxima[] | ResultErrorAsistencia 
}

 type DataInscripcionVigente ={
    id_inscripcion : number,
    vencimiento : string,
    clases_restantes : number,
    dni_alumno : number | null
};

type DataHorarioAsistencia = {
    id_horario_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string,
    sala : string
};

type DataResultErrrorAsistencia = {
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

export interface InfoAlumnoResult {
    nombre_completo : string,
    dni_alumno : number | null,
    email_alumno : string,
    id_inscripcion : number,
    clases_restantes : number,
    vencimiento : string,
    estado : string,
    plan : string
}