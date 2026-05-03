//type Estado = "abierta" | "cerrada";
 export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

export interface idCajaAbierta{
    id_escuela : number
};

export interface DataTipoCuenta {
    id_escuela : number,
    estado : "activos" | "inactivos"
};

 export  interface metricasTipoCuentas {
        id_cuenta: number | string;
        nombre_cuenta: string;
        inicial_cuenta: number;
        movimiento_sesion: number;
        saldo_final_cuenta: number;
        tipo_cuenta : string
  };

export  interface JsonDataCierre {
        id_cuenta : number,
        nombre_cuenta : string,
        sistema : number, 
        real : number,
  };

  export interface  DataCierreCaja {
        id_caja : number,
        id_escuela : number,
        id_usuario_cierre : number,
        monto_final_real : number,
        monto_sistema : number,
        diferencia_total : number,
        arqueo_detalle : JsonDataCierre[]
  };


export interface DetalleApertura {
  id_cuenta: number;
  nombre_cuenta: string;
  monto: number  ;
}
export interface ListadoTipoCuentas{
   id_cuenta : number,
   nombre_cuenta : string,
   tipo_cuenta : "fisico"  | "virtual",
};

export interface DataDetalleCaja{
    id_caja : number  | null,
    id_escuela : number,
    id_categoria : number  | null,
    id_cuenta : number | null,
    id_usuario : number | null,
    monto  : number | null,
    descripcion : string  | null,
    referencia_id : number  | null,  

}; 

export interface RegistroDetalleCaja {
    tipo: string,
    id_escuela: number,
    id_caja : number  | null,
    id_categoria : number  | null,
    id_usuario : number  | null,
    id_cuenta  : number  | null,
    monto  : string ,
    descripcion : string  | null,
    referencia_id : number  | null,
}

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
};


export interface MetricasCajaPanelPrincipal{
    monto_inicial : number,
    total_ingresos : number,
    total_egresos  : number,
    flujo_dia : number,
    balance_neto  : number,
};

export interface AperturaCajaInputs {
    id_escuela: number;
    estado: 'abierta' | 'cerrada'; // Lo tipamos como literal para evitar errores de escritura
    id_usuario_apertura: number | null;   
    detalle :  DetalleApertura[]// Permitimos null por si aún no se asignó
};



export interface AperturaCajaRespuesta {
    id_escuela: number;
    id : number;
    id_usuario: number | null;     // Permitimos null por si aún no se asignó
    monto_inicial: number;
    detalle : DetalleApertura[]
}

export interface CierreCajaData{
    id_caja : number,
    id_escuela : number
    monto_final_real : number,
    id_usuario : number,
};

export interface CierreCajaRespuesta{
    id_caja : number,
    estado : "cerrada"
};

export interface DetalleMovimientoCaja {
    id_caja : number,
    limite : number ,
    offset : number
}

type Estado = "abierta" | "cerrada";


export interface DetalleCajaMovimientoResult {
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
};


    export type EstadoCaja = "abierta" | "cerrada";

    export interface DataCaja{
        id_caja : number | null,
        id_escuela : number | null
    };

    export interface DataMetricasResult {
        monto_inicial: number;
        total_ingresos: number;
        total_egresos: number;
        flujo_del_dia: number;
        total_efectivo: number;
        total_transferencia: number;
        total_debito: number;
        total_credito: number;
        balance_total_real: number;
    };

    export interface DataAperturaCaja{
       id_escuela : number | null,
       estado : EstadoCaja
       id_usuario_apertura : null | number// es por el momento 
    };

    export interface scrollStateData {
        offset : number,
        hasMore : boolean,
        loading : boolean,
        limite : number
    };

    export interface listadoCategoriaCaja{
        id_escuela : number,
        tipo : "ingreso" | "egreso",
        estado :  "activos" | "inactivos";
    };



export interface CategoríaCaja  {
    id_categoria : number,
    id_escuela : number,
    nombre_categoria : string,
    tipo_movimiento : Estado,
    estado : "activos" | "inactivos",
};

export interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
    tipo_movimiento: string;
  }


type MetodoPagoTipo = "efectivo" | "transferencia" | "credito" | "debito";
  export interface Tipo_pago {
    id_tipo_pago: number;
    nombre_tipo_pago: MetodoPagoTipo;
  }

