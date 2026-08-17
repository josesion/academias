import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_HISTORIAL_ESTADO_CAJAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "HISTORIAL_CAJA_ESTADO_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Historial caja ok."
    },

    "CAJA_CERRADADA_HISTORIAL" : {
        status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
        msg : "Caja se encuentra cerrada."
    }

}; 

export const MAPA_HISTORIAL_CAJAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "HISTORIAL_CAJA_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Historial caja ok."
    }

}; 
