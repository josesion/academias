import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                        

export const MAPA_ALTA_HORARIO_GYM : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,

    "SALA_OCUPADA" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "La sala ya tiene un horario asignado en ese día y hora."
    },

    "PROFESOR_OCUPADO" : {
        status : CodigoEstadoHTTP.CONFLICTO,
        msg : "El profesor ya tiene una clase asignada en ese horario."
    },

    "HORARIO_GYM_CREADO" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Horario de gym creado correctamente."
    },
}; 

export const MAPA_MOD_HORARIO_GYM : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,

    "HORARIO_GYM_MODIFICADO" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Horario de gym modificado correctamente."
    },
}; 

export const MAPA_ELIMINAR_HORARIO_GYM : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,

    "HORARIO_GYM_ELIMINADO" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Horario de gym eliminado correctamente."
    },
}; 

export const MAPA_LISTADO_HORARIO_GYM : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,
    
    "CALENDARIO_GYM_LISTADO" : {
        status : CodigoEstadoHTTP.OK,
        msg : "Calendario de gym obtenido."
    },

    "CALENDARIO_GYM_VACIO" : {
        status : CodigoEstadoHTTP.NO_ENCONTRADO,
        msg : "Sin horarios de gym asignados."
    },  
}; 
