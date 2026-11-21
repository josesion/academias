export type estado = "activo" | "inactivo" ;


export interface SalaData {
    nombre : string;
    capacidad : number | null;
    fecha_creacion : string;
    id_escuela : number;
};

export interface ModificarSalaData  extends SalaData{
    id : number;
}

export interface estadoSala {
    id : number,
    id_escuela : number,
    estado : ["activo" , "inactivos"]
};

export interface ResulListadoSalaUsuarios {
    id : number, 
    nombre : string, 
    capacidad : number | null,
    total_registros : number // Para la paginación
}

export interface ResulListSinPagSalaUsuarios {
    id : number, 
    nombre : string,
    capacidad : number | null
};
