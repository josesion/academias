import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;



export const MAPA_HISTORIAL_POST : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

ERROR_SERVIDOR,

 "HISTORIAL_OK" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Historial ok."
    },

};                        

export const MAPA_HISTORIAL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

ERROR_SERVIDOR,

  "LISTADO_ACTIVIDADES_OK" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Historial ok."
    },

 "SIN_HISTORIAL" : {
        status : CodigoEstadoHTTP.SIN_CONTENIDO,
        msg : "Sin listado de historial."
 }, 

};  