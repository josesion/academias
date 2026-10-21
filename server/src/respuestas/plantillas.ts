import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = { status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR , msg : "Error interno de servidor , intente nuevamente" } as const;

export const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;

export const MAPA_PLANTILLAS : Record<string , { status : CodigoEstadoHTTP, msg  : string }> = {
    ERROR_SERVIDOR,
    "PLANTILLA_OK": { status: CodigoEstadoHTTP.OK, msg: "Operacion exitosa." },
    "PLANTILLA_NO_EXISTE": { status: CodigoEstadoHTTP.PROHIBIDO, msg: "Plantilla no existe." },
    "TRANSACCION_OK": { status: CodigoEstadoHTTP.OK, msg: "Operacion exitosa." },
    "TRANSACCION_FALLIDA": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, msg: "Transaccion fallida." },
    "PLANTILLA_ELIMINAR": { status: CodigoEstadoHTTP.OK, msg: "Plantilla eliminada." },
    "PLANTILLA_ELIMINAR_NOT_FOUND": { status: CodigoEstadoHTTP.NO_ENCONTRADO, msg: "Plantilla no existe." },
    "PLANTILLA_ALUMNO_AGREGADO": { status: CodigoEstadoHTTP.OK, msg: "Alumnos agregados a la plantilla." },
    "PLANTILLA_ALUMNO_QUITADO": { status: CodigoEstadoHTTP.OK, msg: "Alumno quitado de la plantilla." },
    "PLANTILLA_DNIS_DUPLICADOS": { status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA, msg: "Hay DNIs duplicados en la plantilla." },
};