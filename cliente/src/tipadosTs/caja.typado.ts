//type Estado = "abierta" | "cerrada";
 export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

export interface idCajaAbierta{
    id_escuela : number
};

export interface DataDetalleCaja{
    id_caja : number  | null,
    id_categoria : number  | null,
    monto  : number | null,
    metodo_pago :  MetodoPago | null,
    descripcion : string  | null,
    referencia_id : number  | null,  
}; 


export interface DataCajaDetalleIDs{
    id_caja : number  | null,
    id_categoria : number  | null,
};

export interface ResultDetalleCaja{
    id_caja : number,
    id_categoria : number,
};