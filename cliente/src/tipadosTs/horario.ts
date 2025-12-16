export interface FiltroProfesor {
    dni: string;
    estado: string;
    id_escuela: number;
};

export interface FiltroNivel {
    nivel : string ,
    estado : string,
    id_escuela : number,
};

export interface FiltroTipo {
    tipo : string ,
    estado : string,
    id_escuela : number,
};


export interface DataProfesor {
    Dni : string ,
    Nombre : string , 
    Apellido : string
};

export interface DataNivel {
    id : number ,
    nivel : string
};

export interface DataTipo {
    id : number ,
    tipo : string
};

