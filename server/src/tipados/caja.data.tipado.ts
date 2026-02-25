

type Estado = "abierta" | "cerrada";
type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito';

export interface DetalleCajaMovimiento {
    id_movimiento: number;
    monto: number; // Viene como DECIMAL(10,2), en JS es number
    metodo_pago: MetodoPago;
    descripcion: string | null; // Puede ser NULL según tu tabla
    nombre_categoria: string;
    tipo_movimiento: Estado;
    
    // Estos campos son los que generamos con DATE() y TIME_FORMAT()
    fecha_grupo: string; // Formato 'YYYY-MM-DD'
    hora_formateada: string; // Formato 'HH:mm'
}

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
};

export interface CategoríaCaja  {
    id_categoria : number,
    id_escuela : number,
    nombre_categoria : string,
    tipo_movimiento : Estado,
    estado : "activos" | "inactivos",
};