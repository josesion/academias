
export enum AlumnoServioCode {
    // Éxito y Estados Esperados
    ALUMNO_ALREADY_EXISTS = "ALUMNO_EXISTE",          
    ALUMNO_ESCHOOL_ALREADY_EXISTS = "ALUMNOESCUELA_EXISTE", 
    ALUMNO_FOUND = "ALUMNO_ENCONTRADO",                
    ALUMNO_CREATED = "ALUMNO_CREAR",
    ALUMNO_DELETE = "ALUMNO_ELIMINAR",
                
    // Fallos (Errores específicos, además de los errores de cliente/BD)
    ALUMNO_NOT_FOUND = "ALUMNO_NO_EXISTE",         
    CREATION_FAILED = "CREATION_FALLO",            
    // Operación de Usuario/Asignación
    USER_ALUMNO_UPDATE = "ALUMNO_MODIFICAR"    

}


export interface AlumnoBase {
    dni: number;
    apellido: string;
    nombre: string;
}


export interface RetornoRegistroAlumno  {
        celular  : string,
        dni: string;
        apellido: string;
        nombre: string;
}

export interface DataAlumnosListado {
    dni_alumno: number,
    nombre: string,
    apellido: string,
    numero_celular: number,
    total_registros: number
}

export interface RetornoModAlumno extends RetornoRegistroAlumno {
   
}
// de mas
export interface RetornodAlumno extends AlumnoBase{
    celular  : string,
}

export interface RetornoIncripcionAlumnoEscuela {
    dni : string,
    id_escuela : number
}

export interface RetornoEliminaciom {
    dni : string;
}

export interface RetornoVerAlumnoExistente {
    dni_alumno : number;
}