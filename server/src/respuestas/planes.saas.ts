import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const;


export const MAPA_POST_PLANES_SAAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
    "PLAN_SAAS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Post planes ok."
        },

}; 