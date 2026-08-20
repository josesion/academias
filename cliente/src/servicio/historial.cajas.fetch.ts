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
};

interface DataResultMetodosPagos {
    id_cuenta : number,
    metodo : string,
    total : number,
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


export interface CajasResumenResponse {
    dataDetalle: MovimientoLibroDiario[] | null;
    dataMetodo: DataResultMetodosPagos[] | null;
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