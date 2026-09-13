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

export const MAPA_MOD_PLANES_SAAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "ID_INVALIDO" : {
            status: CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
            msg: "Credenciales invalidas."
    },
 
    "MOD_PLANES_SAAS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Mod planes ok."
    },

}; 

export const MAPA_DELETE_PLANES_SAAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
    "DELETE_PLANES_SAAS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Delete planes ok."
    },

};

export const MAPA_BAJAS_PLANES_SAAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
    "BAJA_PLANES_SAAS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "Se dio de baja el plane ok."
    },

};

export const MAPA_LISTA_PLANES_SAAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
 
    "LISTA_PLANES_SAAS_OK" : {
            status: CodigoEstadoHTTP.OK,
            msg: "listado de los planes ok."
    },

};