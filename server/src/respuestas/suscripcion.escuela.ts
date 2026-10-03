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