
type  EstadoEnum = "activos" | "inactivos" | "suspendido";
type  TipoMovimientoEnum = "ingreso" | "egreso";

export interface DataCategoriaCajas{
    id_escuela : number;
    nombre_categoria: string;
    tipo_movimiento: TipoMovimientoEnum;
    estado?: EstadoEnum;
}; 

export interface ResultListadoCategoriaCaja{
    id_categoria : string,
    nombre_categoria : string,
    tipo_movimiento: TipoMovimientoEnum;
    total_registros : number
};

