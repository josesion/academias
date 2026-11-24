export enum TutorServicioCode {
    // Éxito y Estados Esperados
    TUTOR_ALREADY_EXISTS = "TUTOR_EXISTE",
    TUTOR_FOUND = "TUTOR_ENCONTRADO",
    TUTOR_CREATED = "TUTOR_CREAR",
    TUTOR_DELETE = "TUTOR_ELIMINAR",

    // Fallos
    TUTOR_NOT_FOUND = "TUTOR_NO_EXISTE",
    CREATION_FAILED = "CREATION_FALLO",

    // Operación de modificación
    TUTOR_UPDATE = "TUTOR_MODIFICAR",

    // Listado
    TUTOR_LISTED = "TUTOR_LISTED"
}

export interface TutorBase {
    dni_tutor: number;
    apellido: string;
    nombre: string;
}

export interface RetornoRegistroTutor {
    id?: number;
    dni_tutor: string;
    apellido: string;
    nombre: string;
    celular: string;
    email?: string;
    relacion_con_alumno: string;
    dni_alumno: string;
}

export interface DataTutoresListado {
    id_tutor: number;
    dni_tutor: number;
    nombre: string;
    apellido: string;
    email: string;
    numero_celular: number;
    relacion_con_alumno: string;
    dni_alumno: number;
    estado: string;
    total_registros: number;
}

export interface DataTutoresListadoSinPag {
    id_tutor: number;
    dni_tutor: number;
    nombre: string;
    apellido: string;
    email: string;
    numero_celular: number;
    relacion_con_alumno: string;
    dni_alumno: number;
    estado: string;
}

export interface RetornoModTutor extends RetornoRegistroTutor {
}

export interface RetornoEliminacionTutor {
    id_tutor: number;
}

export interface RetornoVerTutorExistente {
    dni_tutor: number;
}

export interface DataTutoresPorAlumno {
    id_tutor: number;
    dni_tutor: number;
    nombre: string;
    apellido: string;
    email: string;
    numero_celular: number;
    relacion_con_alumno: string;
    estado: string;
}
