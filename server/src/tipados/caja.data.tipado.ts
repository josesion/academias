

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
    nombre_alumno_vinculado : string;

    // Spec 050 — Estado de retención
    estado_retencion: string | null;
}

export interface DataAltaCaja{
    id_escuela : number,
    estado : Estado,
    id_usuario : number | null,
};

export interface DataAltaCajaResult{
    id_escuela : number,
    id_usuario_apertura : number | null,
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

// ============================================================
// Spec 050 — Transferencias internas y Retenciones en caja
// ============================================================

/** Estado del ciclo de vida de una retención de efectivo. */
export type EstadoRetencion = "activa" | "devuelta" | "justificada";

/** Retención activa lista para mostrarse en el panel de caja. */
export interface RetencionActiva {
    id_movimiento: number;
    id_caja: number;
    id_cuenta: number;
    nombre_cuenta: string;
    monto: number;
    descripcion: string | null;
    fecha_movimiento: string;
    hora_formateada: string;
    estado_retencion: EstadoRetencion;
}

/** Resultado de registrar una transferencia entre cuentas. */
export interface ResultTransferenciaCaja {
    id_transferencia: number;
    id_movimiento_egreso: number;
    id_movimiento_ingreso: number;
}

/** Resultado de registrar una retención. */
export interface ResultRetencionCaja {
    id_movimiento: number;
    monto: number;
    estado_retencion: EstadoRetencion;
}

/** Resultado de devolver o justificar una retención. */
export interface ResultResolverRetencion {
    id_movimiento: number;
    estado_retencion: EstadoRetencion;
    monto_devuelto: number;
    id_movimiento_diferencia: number | null;
};