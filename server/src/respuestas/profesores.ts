import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_PROFESORES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "ERROR_ALTA_PROFESPOR_MAESTRO" : {
        status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg : "Error en la creacion de profesor maestro"
    },

  "PROFESOR_EXISTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "El profesor ya se encuentra anotado."
  },
  
 "ALTA_PROFE_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg  : "Se anoto correctamente."
 } 

}; 


export const MAPA_MOD_PROFESORES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "MODIFICACION_PROFE_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Se modifico correctamente"
    },
}; 


export const MAPA_ESTADO_PROFESORES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "MODIFICACION_PROFE_ELIMINAR_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Se dio de baja correctante."
    },

    "MODIFICACION_PROFE_ALTA_OK" : {
       status : CodigoEstadoHTTP.OK,
       msg : "Se dio de alta correctante."
    },
}; 

export const MAPA_LISTADO_PROFESORES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LISTADO_PROFESOR_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado de profesores."
    },
}; 

export const MAPA_LISTADO_SIN_PAG_PROFESORES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "LISTADO_PROFESORES_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado de profesores."
    },

    "LISTADO_PROFESORES_VACIO" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado de profesores vacio."
    },    
}; 