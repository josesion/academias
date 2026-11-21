import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                        


export const MAPA_ALTA_SALA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SALA_EXISTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "La sala ya existe en esta escuela."
    },

    "SALA_ALTA_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Sala creada correctamente."
    },
    
}; 


export const MAPA_MOD_SALA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SALA_NO_EXISTE" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "La sala no existe."
    },

    "SALA_EXISTE" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "La sala ya existe en esta escuela."
    },

    "MOD_SALA_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Sala modificada correctamente."
    },

}; 


export const MAPA_ESTADO_SALA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SALA_NO_EXISTE" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "La sala no existe."
    },

    "ESTADO_SALA_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Estado sala modificado correctamente."
    },

}; 


export const MAPA_LISTADO_SALA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,
    
    "LISTADO_SALAS_OK" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Listado salas."
    },

    "SIN_LISTADO_SALAS"  : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Sin lista de salas."
    },  
    
}; 
