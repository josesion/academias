export type estado = "activo" | "inactivo" ;


export interface NivelData {
    nivel : string;
    fecha_creacion : string;
    id_escuela : number;
};

export interface ModificarNivelData  extends NivelData{
    id : number;
}

export interface estadoNivel {
    id : number,
    id_escuela : number,
    estado : ["activo" , "inactivos"]
};

export interface ResulListadoNivelUsuarios {
    id : number, 
    nivel : string, 
    total_registros : number // Para la paginación
}

export interface ResulListSinPagNivelUsuarios {
    id : number, 
    nivel : string
};