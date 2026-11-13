import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_POST_SUSCRIPCION : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SUSCRIPCION_ACTIVA" : {
            status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
            msg: "Esta escuela tiene una suscripcion activa."
    },
 
    "SUSCRIPCION_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Post Suscripcion ok."
    },

}; 

export const MAPA_GET_SUSCRIPCION : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "LISTADO_SUSP_EMPY" : {
            status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
            msg: "Sin contenido."
    },
 
   "LISTADO_SUSP_OK": {
            status: CodigoEstadoHTTP.OK,
            msg: "Get Suscripcion ok."
    },

}; 

export const MAPA_GET_ESC_PLAN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "ESC_PLAN_EMPTY" : {
            status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
            msg: "Sin contenido."
    },

    "ESC_PLAN_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Get escuelas y planes ok."
    },

}; 

export const MAPA_ANULAR_SUSCRIPCION : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SUSCRIPCION_ANULAR_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Suscripcion anulada ok."
    },

}; 

export const MAPA_METRICAS_SIMPLES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SIN_METRICAS_SIMPLES" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin metricas simples."
    },

    "METRICAS_SIMPLES_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas simples ok."
    },

}; 