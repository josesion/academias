export enum ProfesorServicioCode {
    // Éxito y Estados Esperados
    PROFESOR_ALREADY_EXISTS = "PROFESOR_EXISTE",                 // El profesor global ya existe (al crear)
    PROFESOR_ESCUELA_ALREADY_EXISTS = "PROFESORESCUELA_EXISTE",  // La asignación profesor-escuela ya existe
    PROFESOR_FOUND = "PROFESOR_ENCONTRADO",                      // Profesor encontrado correctamente
    PROFESOR_CREATED = "PROFESOR_CREAR",                         // Creación de profesor global exitosa
    PROFESOR_ESCUELA_CREATED = "PROFESORESCUELA_CREAR",          // Creación de asignación profesor-escuela exitosa

    // Fallos (Errores específicos)
    PROFESOR_NOT_FOUND = "PROFESOR_NO_ENCONTRADO",               // Profesor no encontrado
    CREATION_FAILED = "CREATION_FALLO",                          // Fallo genérico en creación

    // Operaciones de modificación
    PROFESOR_UPDATE = "PROFESOR_MODIFICAR",                      // Éxito al modificar profesor
    PROFESOR_ESCUELA_UPDATE = "PROFESORESCUELA_MODIFICAR"        // Éxito al modificar asignación profesor-escuela
}

type celular = string | null ;

export type dni = string ;

export interface FiltroProfeEscuela {
    id_escuela : number ,
    dni         : dni 
};

export interface ProfesoresGlobales {
    dni        : dni;
    nombre     : string;
    apellido   : string;
    celular    : celular ;
};


export interface FiltroProfeEscuelaBaja  extends FiltroProfeEscuela {
    estado : "activos" |  "inactivos"
}

export interface ResulListadoProfesoresUsuarios {
    dni : string, 
    nombre : string,
    apellido : string, 
    celular : string, 
    total_registros : number // Para la paginación
};

export interface ListadoProfeResults{
    Dni : string ;
    Nombre : string ;
    Apellido : string ;
};


