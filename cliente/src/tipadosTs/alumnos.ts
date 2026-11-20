/** Datos básicos que devuelve el backend de un alumno. */
export interface UserData {
    dni?: number | string,
    nombre: string,
    apellido: string,
    email: string,
    pin_asistencia?: string
}

/** Parámetros para el registro de un alumno. El email es obligatorio y único; el DNI es opcional. */
export interface RegistroResquest {
    dni?: number | string,
    nombre: string,
    apellido: string,
    celular: string,
    email: string,
    pin_asistencia?: string
}

/** Filtros para el listado de alumnos. El email reemplaza al DNI como identificador principal. */
export interface DataAlumnosListado {
    dni?: string | number,
    email?: string,
    nombre: string,
    apellido: string,
    estado: string
}

export interface Paginacion {
    pagina: number,
    limite: number,
}

/** Respuesta del backend con los datos de un alumno del listado. */
export interface AlumnosResponse {
    Apellido: string,
    Dni?: string | number,
    Nombre: string,
    Celular: string | number,
    email: string,
    pin_asistencia?: string
}

/** Datos para dar de baja o restaurar un alumno. El email es el identificador principal. */
export interface bajaAlumno {
    email: string,
    dni?: string,
    estado: string
}


