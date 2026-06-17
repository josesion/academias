
export interface listadoPlanUsuario {
    descripcion : string,
    estado     :  string
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
    fecha_creacion : string,
    estado : string,
    descripcion : string,
    cantidad_clases : number, 
    cantidad_meses : number, 
    monto : number,
}

export interface ModPlanesUsuarios {
    id : number,
    descripcion : string,
    cantidad_clases : number,
    cantidad_meses  : number,
    monto : number,
}

export interface EliminarPlanUsuario {
    id : number ,
    estado  : string
}

export interface  EliminarPlanUsuariosResponse {
    descripcion : string,
    fecha_creacion : string,
    id_plan : number,
    
}

export interface ModPlanesUsuariosResult extends CrearPlanesUsuarios {};

