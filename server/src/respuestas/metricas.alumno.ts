import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_METRICAS_ALUMNOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
   "CORREO_INVALIDO_SERVIDOR" : {
            status: CodigoEstadoHTTP.NO_AUTORIZADO,
            msg: "Problemas con el correo/dni."
        },    

    "METRICAS_PRINCIPALES_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas ok."
        },

};                          


export const MAPA_INFO_ESCUELA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
   "CORREO_INVALIDO_SERVIDOR" : {
            status: CodigoEstadoHTTP.NO_AUTORIZADO,
            msg: "Problemas con el correo/dni."
        },    

    "DATA_ESCUELA_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Info Escuela ok."
        },

}; 

export const MAPA_HORARIO_ESCUELA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 

    "HORARIO_ESCUELA_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Info Escuela horario ok."
        },

}; 