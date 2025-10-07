// parametros que devuelve el backend de un alumno
export interface UserData{
    dni : number,
    nombre : string,
    apellido : string
}

// Parametros para el registro de un alumno
export interface RegistroResquest {
    dni : number | string,
    nombre : string,
    apellido : string ,
    celular  : string,
    id_escuela : number
}


export interface DataAlumnosListado {
    dni: string | number,
    nombre: string,
    apellido: string,
    estado: string,
    id_escuela: number
}

export interface Paginacion {
    pagina : number,
    limite : number,
}

export interface AlumnosResponse {
    Apellido : string,
    Dni : string | number,
    Nombre : string,
    Celular: string | number
}

export interface bajaAlumno {
    dni : string,
    id_escuela : number,
    estado : string
}


