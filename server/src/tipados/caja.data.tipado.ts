

type Estado = "abierta" | "cerrada";
type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito';

export interface DetalleCajaMovimiento {
    id_movimiento: number;
    monto: number; 
    descripcion: string | null;
    referencia_id: number | null; // Lo agregamos porque está en tu SQL
    nombre_categoria: string;
    tipo_movimiento: 'ingreso' | 'egreso'; // Refleja el tipo de movimiento de la categoría
    
    // Nuevos campos de la tabla cuentas_escuela
    nombre_cuenta: string; // Ej: "Efectivo", "Mercado Pago"
    tipo_cuenta: 'fisico' | 'virtual';
    
    // Campos formateados por MySQL
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
    id_usuario_apertura : number | null,
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