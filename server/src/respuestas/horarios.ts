import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_LISTADO_HORARIO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

  "CALENDARIO_ESCUELA_LISTADO" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Calendario ok."
    },

  "CALENDARIO_VACIO": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "Sin calendario."
    },

}; 

export const MAPA_ALTA_HORARIO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

  'HORARIOS_CLASES_EXISTE' : {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "Este horario ya se encuentra ocupado."
    },

  'HORARIOS_PROFESOR_EXISTE' : {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "El profesor ya se ecnuentra asignado en este horario."
    },

  "HORARIO_CREADO_EXITOSAMENTE" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Se asigno correctamente el horario."
    },    

}; 


export const MAPA_MOD_HORARIO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "HORARIO_MODIFICADO_EXITOSAMENTE" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Se modifico correctamente el horario."
    },    

}; 


export const MAPA_ELIMINAR_HORARIO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "HORARIO_ELIMINADO" : {
        status: CodigoEstadoHTTP.OK,
        msg: "Se elimino correctamente el horario."
    },    

}; 