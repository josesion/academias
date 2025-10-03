//TipadoData , se lo usaria para el contrato que devuelva
// las funciones de la data para los controladores
export type TipadoData<T> ={
    error : boolean;
    message : string;
    data : T | [];
    paginacion ? : {
                    pagina : number , 
                    limite : number,
                    contadorPagina : number};
    code : string;
    errorsDetails?: any;
}

// --------------- PLANES ------------------
// DataPlan es el tipado de los datos que se manejan en la tabla planes_mensuales_admin
// Se usa para tipar el retorno de las funciones de la data
export interface DataPlan {
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}

export interface DataPlanMod {
    id : number ;
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}

export interface DataPlanesListado {
    id: number;
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}


// ------------ USUARIOS ------------------
// DataUsuarioNuevo es el tipado de los datos que se manejan al crear un nuevo usuario
export interface DataUsuarioNuevo {
    usuario : string;
    correo : string;    
}

export interface DataIdUsuario{
    usuario : string
}

export interface DataModPublico {
    usuario : string,
    nombre?  : string,
    apellido?: string,
    celular? : string,
    correo?  : string
}

export interface DataModPrivado {
    usuario : string ,
    rol?    : string,
    estado? : string
}

export interface UsuarioListado {
    usuario: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    celular: string;
    rol: string;
    fecha_alta: string | Date; // Puede ser una cadena ISO o un objeto Date
    correo: string;
    estado: string;
    id_escuela: number
}

// Tipado para el retorno de la función de login
export interface DataLogin {
    usuario: string;
    nombre : string,
    apellido : string,
    estado : string,
    rol : string
    id_escuela : number
}