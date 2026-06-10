import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_PLAN : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

   "ERROR_ALTA_PLAN_MAESTRO": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "Error al crear el plan maestro"
    },

   "ERROR_ID_PLAN_MAESTRO": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Error al obtener el ID del plan"
    },

    "ERROR_ALTA_PLAN_ESCUELA": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "Error al asignar el plan a la escuela"
    },

    "PLAN_ESCUELA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Plan asignado a la escuela exitosamente"
    },

   "PLAN_EXISTENTE_PLAN_ESCUELA" : {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "La asignación del plan a la escuela ya existe"
   } 
}; 


export const MAPA_MOD_PLAN :  Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

   "PLAN_MODIFICACION_OK" : { 
        status : CodigoEstadoHTTP.OK , 
        msg : "Se modifico el plan correctamente"
    },
   
   ERROR_SERVIDOR,
};


export const MAPA_ESTADO_PLAN :  Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

   "ESTADO_PLAN_MODIFICACION_OK" : { 
        status : CodigoEstadoHTTP.OK , 
        msg : "Se modifico el estado del plan correctamente"
    },
   
   ERROR_SERVIDOR,
};


export const MAPA_LISTADO_PLAN :  Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

   "PLANES_LISTADO_OK" : { 
        status : CodigoEstadoHTTP.OK , 
        msg : "Listado planes correctamente"
    },
   
   ERROR_SERVIDOR,
};