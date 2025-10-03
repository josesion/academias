
export interface RetornoRegistroAlumno {
    dni : string,
    apellido : string,
    nombre  : string
}

export interface DataAlumnosListado {
    dni_alumno: number,
    nombre: string,
    apellido: string,
    numero_celular: number,
    total_alumnos: number
}

export interface RetornoModAlumno {
    dni : string,
    nombre : string,
    apellido : string ,
    celular  : string,
}

export interface RetornodAlumno {
    dni : string,
    nombre : string,
    apellido : string ,
    celular  : string,
}

export interface RetornoIncripcionAlumnoEscuela {
    dni : string,
    id_escuela : number
}