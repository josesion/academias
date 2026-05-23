import { CodigoEstadoHTTP } from "../tipados/generico"; 

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR ,
                         msg : "Error interno de servidor , intente nuevamente" } as const ;

export const MAPA_INSCRIPCION : Record< string, { status : CodigoEstadoHTTP , msg : string}> = {

     "INSCRIPCION_EXISTENTE" : { status : CodigoEstadoHTTP.CONFLICTO , msg : "El alumno ya se encuentra inscripto actualmente"},

    "INSCRIPCION_CREACION_FALLIDA" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "No se pudo crear la inscripción"},

    "NO_SE_LOGRO_VERIFICAR" : { status : CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE, msg : "No se pudo crear la inscripción"},

    "INSCRIPCION_EXITOSA" : { status : CodigoEstadoHTTP.OK , msg : "Inscripcion creada Exitosamente "},

    ERROR_SERVIDOR
};


export const MAPA_LISTADO_INSCRIPCIONES : Record< string , { status : CodigoEstadoHTTP , msg : string} > = {

    "LISTADO_INSCRIPCION_OK" : { status : CodigoEstadoHTTP.OK , msg : "Listado de inscripciones obtenido correctamente" },

   "LISTADO_VACIO" : { status : CodigoEstadoHTTP.NO_ENCONTRADO , msg : "No se encontraron inscripciones con los filtros aplicados"}, 

    ERROR_SERVIDOR
};




export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;