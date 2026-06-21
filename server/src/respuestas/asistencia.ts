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