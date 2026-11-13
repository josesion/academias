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

export const MAPA_USUARIOS_ESCUELAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LISTA_USUARIOS_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Lista usuarios ok."
    },

    "SIN_USUARIOS_ESCUELA" : {
        status :CodigoEstadoHTTP.SIN_CONTENIDO,
        msg : "Esta escuela no tiene usuarios."
    }

}; 

export const MAPA_LIBRO_DIARIO : Record< string, {status : CodigoEstadoHTTP, msg : string}> = {

    ERROR_SERVIDOR,

    "LISTADO_DETALLE_CAJA_OK"  : {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado del detalle de caja ok."
    },

     "CAJA_SIN_DETALLE" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Esta caja no contiene detalles en el."
     }

};
