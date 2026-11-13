
export interface TipoData {
     tipo : string,
     id_escuela : number
};

export interface ResulListadoTipoUsuarios {
    id : number, 
    tipo : string, 
    total_registros : number // Para la paginación
}