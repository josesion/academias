import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_NIVEL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "NIVEL_EXISTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "Este nivel ya existe en la escuela."
    },

  "NIVEL_ALTA_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Nivel creado correcatente."
  },
  
}; 

export const MAPA_MOD_NIVEL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "NIVEL_EXISTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "Este nivel ya existe en la escuela."
    },

  "MOD_NIVEL_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Nivel modificado correcatente."
  },
  
}; 


export const MAPA_ESTADO_NIVEL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
    
  "ESTADO_NIVEL_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Estado nivel modificado correctamente."
  },
  
}; 

export const MAPA_LISTADO_NIVEL : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
    
  "LISTADO_NIVELES_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "listado niveles."
  },

"SIN_LISTADO_NIVELES"  : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Sin lista de niveles."
  },  
 
}; 