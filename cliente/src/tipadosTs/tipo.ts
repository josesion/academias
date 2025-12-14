interface TipoData {
    tipo : string ,
    id_escuela : string
};

export interface altaTipo extends TipoData {} ;

export interface modTipo extends TipoData {
    id : number
};

export interface estadoTipo extends TipoData {
    estado : string,
    id : number
};

export interface Paginacion {
    pagina : number,
    limite  : number,
};

export interface listadoTipoSinPaginacion{
    tipo : string,
    id_escuela : number
    estado : string
};
