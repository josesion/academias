type Estado = "abierta" | "cerrada";
type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

export interface DataAltaCaja{
    id_escuela : number,
    estado : Estado,
    id_usuario : number | null,
    monto_inicial : number
};

export interface DataAltaCajaResult{
    id_escuela : number,
    id_usuario : number | null,
    monto_inicial : number
};

export interface DataDetalleCaja{
    id_caja : number,
    id_categoria : number,
    monto  : number | null,
    metodo_pago :  MetodoPago,
    descripcion : string  | null,
    referencia_id : number  | null,  
}; 

export interface ResultDetalleCaja{
    id_caja : number,
    id_categoria : number,
};

export interface ResultAqueoCaja{
    total_ingresos : number,
    total_egresos : number,
    balance_neto : number,
    monto_inicial : number,
    monto_sistema_calculado : number
};
