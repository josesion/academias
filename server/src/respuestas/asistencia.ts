import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;                         


export const MAPA_ALTA_ASISTENCIA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "INSCRIPCION_NO_EXISTE" : {
        status: CodigoEstadoHTTP.PROHIBIDO,
        msg: "Sin inscripciones activas."
    },

   'ALUMNO_EN_CLASE': {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "El alumno se encuentra en clase."
    },

   "FUERA_DE_VENTANA_HORARIA": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "No estás dentro del horario permitido para marcar asistencia."
    },

    "TRANSACCION_FALLIDA" : {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No estás dentro del horario permitido para marcar asistencia."
    },

   'ASISTENCIA_OK': {
        status: CodigoEstadoHTTP.OK,
        msg: "No estás dentro del horario permitido para marcar asistencia."
    },

    /* Spec 043 · asistencia manual: la clase tiene que ser la de ahora o la
       próxima (a diferencia del kiosko, no hay ventana horaria de minutos). */
   "CLASE_NO_PERMITIDA": {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg: "Sólo se puede registrar asistencia en la clase que está en curso o en la próxima."
    },


};

export const MAPA_CLASES_ASISTENCIA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    'CURSANDO_PROXIMA_CLASES_OK': {
        status: CodigoEstadoHTTP.OK,
        msg:  "Resultado de clases acutal y proxima."
    },


}; 


export const MAPA_DATA_ASISTENCIA : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "INSCRIPCION_NO_EXISTE": {
        status: CodigoEstadoHTTP.PROHIBIDO,
        msg:  "El alumno no tiene plan."
    },

    "HORARIO_NO_EXISTE" : {
        status: CodigoEstadoHTTP.CONFLICTO,
        msg:  "No hay un horario de clase."     
    },

    "ASISTENCIA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg:  "Horario de clase en curso."    
    },
}; 

export const MAPA_INFO_ALUMNO : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,
    "INFO_ALUMNO_OK": {
        status: CodigoEstadoHTTP.OK,
        msg:  "Info alumno obtenida."
    },
    "INFO_ALUMNO_NO_EXISTE": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg:  "El alumno no tiene plan activo."
    },
    "BUSCAR_ALUMNO_OK": {
        status: CodigoEstadoHTTP.OK,
        msg:  "Búsqueda realizada."
    },
}; 