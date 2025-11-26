
export interface NivelData {
    nivel : string;
};

export interface RegistroNivel extends NivelData {
    id_escuela: number;
};

export interface ModNivel {
    id : number,
    id_escuela : number,
    nivel : string
};

export interface estadoNivel extends ModNivel{
    estado : string
};


export interface ResultRegistroNivel {
    nivel : string ,
    id    : number
}

export interface Paginacion {
    pagina : number,
    limite  : number,
}

export interface ListadoNivel {
    nivel : string, 
    estado : string,
    id_escuela : number,
};