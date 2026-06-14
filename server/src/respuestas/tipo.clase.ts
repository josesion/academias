import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_TIPO_CLASE : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

 "TIPO_CLASE_EXISTE": {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "Tipo de clase ya existe."
    },

"TIPO_CLASE_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Tipo de clase agregada correctamente ."
  },
  
}; 


export const MAPA_MOD_TIPO_CLASE : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "TIPO_CLASE_EXISTE": {
            status : CodigoEstadoHTTP.CONFLICTO,
            msg : "Tipo de clase ya existe."
        },

    "TIPO_CLASE_MOD_OK" : {
            status : CodigoEstadoHTTP.OK,
            msg : "Tipo de clase se modifico correctamente."
    },
  
};


export const MAPA_ESTADO_TIPO_CLASE : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

   "TIPO_CLASE_ESTADO_OK" : {
            status : CodigoEstadoHTTP.OK,
            msg : "El estado se modifico correctamente."
    },
  
};


export const MAPA_LISTADO_TIPO_CLASE : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

   "TIPO_CLASE_LISTADO_OK" : {
            status : CodigoEstadoHTTP.OK,
            msg : "Listado de tipo de clases."
    },
  
  "SIN_LISTADO_TIPO_CLASE" : {
            status : CodigoEstadoHTTP.NO_ENCONTRADO,
            msg : "Sin listado de tipo de clases."
    },

};