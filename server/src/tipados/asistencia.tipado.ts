

export interface ResultadoClaseEnCruso {
    id_horario_en_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string
}

export interface ResultadoClaseProxima{
   id_horario_prox_clase : number,
   hora_inicio : string, 
   hora_fin : string,
   nombre_clase : string
}

export interface ResultErrorAsistencia {
    error : boolean | null,
    message : string | null,
    code : string | null
}


export interface ResulClases_curso_proxima{
    enCursoClase : ResultadoClaseEnCruso | ResultErrorAsistencia ,
    proximaClase : ResultadoClaseProxima | ResultErrorAsistencia 
}