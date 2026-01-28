type  EstadoEnum = "activos" | "inactivos" | "suspendido";
type  TipoMovimientoEnum = "ingreso" | "egreso" ;



export interface DataCategoria{
    nombre_categoria : string,
    tipo_movimiento  : TipoMovimientoEnum,
    estado   : EstadoEnum,
    id_escuela : number
}; 

export interface ModCategoriaCaja{
    id_categoria : number,
    nombre_categoria : string,
    tipo_movimiento : TipoMovimientoEnum,
    estado : EstadoEnum,
    id_escuela : number
};

export interface BajaCategoriaCaja{
    id_categoria : number,  
    estado : EstadoEnum,
    id_escuela : number
};

export interface ResultListadoCategoriaCaja extends BajaCategoriaCaja {};

export interface ListadoData extends DataCategoria{
    limite : number,
    pagina : number,
    id_escuela : number
};