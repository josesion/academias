type  EstadoEnum = "activos" | "inactivos" | "suspendido";
type  TipoMovimientoEnum = "ingreso" | "egreso" ;



export interface DataCategoria{
    nombre_categoria : string,
    tipo_movimiento  : TipoMovimientoEnum,
    estado   : EstadoEnum,

}; 

export interface ModCategoriaCaja{
    id_categoria : number,
    nombre_categoria : string,
    tipo_movimiento : TipoMovimientoEnum,
    estado : EstadoEnum
};

export interface BajaCategoriaCaja{
    id_categoria : number,  
    estado : EstadoEnum,
    nombre_categoria : string,
};

export interface ResultListadoCategoriaCaja extends BajaCategoriaCaja {};

export interface ListadoData extends DataCategoria{
    limite : number,
    pagina : number,
};