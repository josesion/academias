import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_METRICAS_ALUMNOS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "METRICAS_PRINCIPALES_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas ok."
        },

};                          