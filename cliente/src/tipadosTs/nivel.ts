
export interface NivelData {
    nivel : string;
};

export interface RegistroNivel extends NivelData {
};

export interface ModNivel {
    id : number,
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
};