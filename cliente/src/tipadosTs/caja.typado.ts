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

export interface MetricasCaja {
    id_caja : number,
    id_escuela : number
};

export interface MetricaPanelPrincipal {
    id_caja: number;
    monto_inicial: number;
    
    // Totales generales del movimiento
    total_ingresos: number;
    total_egresos: number;
    
    // El neto del día (Ingresos - Egresos)
    flujo_del_dia: number;

    // Desglose por método de pago (específico para ingresos)
    total_efectivo: number;
    total_transferencia: number;
    total_debito: number;
    total_credito: number;

    // El monto final que debería haber sumando el inicial
    balance_total_real: number;
}