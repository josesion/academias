import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

export interface DataEstadoResult{
      id_caja : number, 
      cajero : string,
      fecha_apertura : string,
      hora_apertura : string,
      estado : "abierta" | "cerrada",
      total : number,
      totales : {
         efectivo : number,
         virtual  : number
      }
};

export const estadoHistoriaCajas = async ()
:Promise<ApiResponse<DataEstadoResult>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }; 
    
    const rutaCompleta = `${PAGINA}api/estado_caja_historial`;    

    return await apiFetch( rutaCompleta, {
        method : "GET"
    });
};


export interface PaginacionProps {
    contadorPagina? : number,
    pagina? : number,
    limite? : number
}

interface HistorialCaja {
    id_caja: number;
    fecha: {
        apertura: string; 
        cierre: string;   
    };
    hora: {
        apertura: string; 
        cierre: string;   
    };
    observaciones: string | null;
    monto_sistema: number;
    monto_real: number;
    monto_faltante: number;
    /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
    usuario_apertura: string;
    /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
    usuario_cierre: string;
};

interface DataResultMetodosPagos {
    id_cuenta : number,
    metodo : string,
    /**
     * Saldo por cuenta (ingresos − egresos, **incluye** el "Saldo Inicial").
     *
     * En el listado (`GET /api/list_estado_caja`) es la Σ de los saldos
     * finales de las cajas que pasan los filtros; en el libro diario
     * (`GET /api/detalle_caja_resumen`) es el saldo de esa caja
     * (spec 042 · Ampliación 3 · A4).
     */
    total : number,
    /**
     * Dinero que **circuló** por la cuenta (ingresos − egresos, **excluye** el
     * "Saldo Inicial"). Campo **nuevo** (spec 042 · Ampliación 3 · A4).
     *
     * Es **opcional** porque el endpoint del libro diario no lo manda y el
     * mismo tipo se usa en los dos.
     */
    flujo? : number,
    /**
     * Color asignado por índice en `ListadoCajasBase.ts` (no lo manda la API):
     * lo usa el gráfico para que un método conserve el mismo color.
     */
    color? : string,
};

export interface CajasServicioResponse {
    dataDetalle: HistorialCaja[] | null;
    dataMetodo: DataResultMetodosPagos[] | null;
    paginacion : PaginacionProps | null 
};

export interface InputHistorialCajas {
    idUsuarioFiltro: number | null;
    estadoDiferencia: "exacta" | "con_diferencia" | null;
    fechaDesde: string;
    fechaHasta: string;
    pagina: number;
   
};

export const historialCajas = async( props : InputHistorialCajas, signal? : AbortSignal)
:Promise<ApiResponse<CajasServicioResponse>>=>{
        const { 
            idUsuarioFiltro, 
            estadoDiferencia, 
            fechaDesde, 
            fechaHasta,
            pagina,
        } = props;



    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

const parametrosConvertidos: Record<string, string> = {
        id: idUsuarioFiltro !== null && idUsuarioFiltro !== undefined ? String(idUsuarioFiltro) : "null",
        fechaD: fechaDesde !== undefined ? String(fechaDesde) : "",
        fechaH: fechaHasta !== undefined ? String(fechaHasta) : "",
        estado: estadoDiferencia !== null && estadoDiferencia !== undefined ? String(estadoDiferencia) : "null",
        pagina: pagina !== undefined ? String(pagina) : "1",
    };


    const rutaCompleta = `${PAGINA}api/list_estado_caja?${new URLSearchParams(parametrosConvertidos).toString()}`;  
    return await apiFetch( rutaCompleta, {
        method : "GET", signal : signal
    });  

};

export interface ResultUsuariosEscuela {
    id_usuario : number,
    usuario : string
}


export const usuariosEscuelas = async ()
:Promise<ApiResponse<ResultUsuariosEscuela[]>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }; 

   const rutaCompleta = `${PAGINA}api/usuarios_escuela`;   
   
   return await apiFetch( rutaCompleta , { 
        method : "GET"
   });
};


export interface DataResumen {
    id_caja : number
};

interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  categoria: string;
  descripcion: string | null;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
};


/**
 * Ítem del arqueo de una cuenta (método de pago), tal como se persistió en
 * `cajas.arqueo_detalle` al cerrar la caja.
 *
 * - `sistema`: lo que el sistema decía que había en esa cuenta.
 * - `real`: el conteo real que escribió el cajero.
 */
export interface ArqueoDetalleItem {
    id_cuenta : number;
    nombre_cuenta : string;
    sistema : number;
    real : number;
}

/**
 * Resumen del arqueo de una caja: el desglose por cuenta (`detalle`), los
 * totales de la caja y **quién abrió y quién cerró** la caja (spec 042 ·
 * Ampliación 2 · A3).
 */
export interface ArqueoCajaResumen {
    detalle : ArqueoDetalleItem[];
    diferencia_total : number;
    monto_sistema : number;
    monto_final_real : number;
    /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
    usuario_apertura : string;
    /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
    usuario_cierre : string;
}


export interface CajasResumenResponse {
    dataDetalle: MovimientoLibroDiario[] | null;
    dataMetodo: DataResultMetodosPagos[] | null;
    dataArqueo: ArqueoCajaResumen | null;
};


export const detalleCajaResumen =async ( data : DataResumen)
:Promise<ApiResponse<CajasResumenResponse>>=>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }; 

    
    const parametrosConvertidos: Record<string, string> = {
        id : String(data.id_caja)
    };
   
   const rutaCompleta = `${PAGINA}api/detalle_caja_resumen?${new URLSearchParams(parametrosConvertidos).toString()}`; 

   return await apiFetch( rutaCompleta, {
        method : "GET"  
   });

};