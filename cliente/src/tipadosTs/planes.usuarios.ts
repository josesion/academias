
export interface listadoPlanUsuario {
    descripcion : string,
    estado     :  string,
    id_escuela: number
}   


export interface Paginacion {
    pagina : number,
    limite : number,
}

export interface PlanesUsuarioResponse {
    id : number,
    descripcion : string,
    clases : number,
    meses : number,
    monto : number,

};



export interface PlanesUsuariosBase {
    descripcion : string,
    cantidad_clases : number, 
    cantidad_meses : number, 
    monto : number,
}

export interface CrearPlanesUsuarios  {
    id? : number // Opcional, puede ser autogenerado por la BD
    id_escuela : number,
    fecha_creacion : string,
    estado : string,
    descripcion : string,
    cantidad_clases : number, 
    cantidad_meses : number, 
    monto : number,
}

export interface ModPlanesUsuarios {
    id : number,
    id_escuela : number,
    descripcion : string,
    cantidad_clases : number,
    cantidad_meses  : number,
    monto : number,
}

export interface EliminarPlanUsuario {
    id : number ,
    id_escuela : number ,
    estado  : string
}

export interface  EliminarPlanUsuariosResponse {
    descripcion : string,
    fecha_creacion : string,
    id_escuela : number,
    id_plan : number,
    
}

export interface ModPlanesUsuariosResult extends CrearPlanesUsuarios {};

