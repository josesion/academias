import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;


export const MAPA_METRICAS_TARJETAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SIN_CAJA_ABIERTA" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin caja abierta."
        },

    "SIN_METRICAS_CAJA": {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin metrica de total de caja."
        },

    "SIN_METRICAS_INSCRIPCIONES": {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin metricas de inscripcion alumnos."
        },

    "SIN_METRICAS_VENCIMIENTOS": {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin metricas de vencimientos."
        },

    "METRICAS_OK": {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas ok."
        },

}; 


export const MAPA_METRICAS_CLASES : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

     "SIN_METRICAS_CLASES" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin datos de la clase."
        },

   "CLASES_OK": {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas ok."
        },

}; 


export const MAPA_METRICAS_ASISTENCIAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {

    ERROR_SERVIDOR,

    "SIN_HORARIO_CLASES" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin horario de clases."
        },

    "SIN_ALUMNOS_ASISTENCIA" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "Sin asistencia para esta clase."
        },

   "ERROR_DATOS" : {
            status: CodigoEstadoHTTP.NO_ENCONTRADO,
            msg: "No se encontro el identificador del horario."
        },


   "ASISTENCIA_OK": {
            status: CodigoEstadoHTTP.OK,
            msg: "Metricas ok."
        },

};