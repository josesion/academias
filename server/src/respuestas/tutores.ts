import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                         msg: "Error interno de servidor, intente nuevamente" } as const;

export const ERROR_INTERNO_SERVIDOR = {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error en el servidor, por favor intente nuevamente"
} as const;

export const MAPA_ALTA_TUTOR: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "TUTOR_YA_REGISTRADO": { status: CodigoEstadoHTTP.CONFLICTO, msg: "El tutor ya se encuentra registrado con ese DNI" },

    "REGISTRO_TUTOR_OK": { status: CodigoEstadoHTTP.OK, msg: "Se registró correctamente el tutor" },

    "ERROR_SERVIDOR": { status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR, msg: "Error en el servidor, intentar nuevamente." }
};

export const MAPA_MOD_TUTOR: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "TUTOR_MODIFICAR_OK": { status: CodigoEstadoHTTP.OK, msg: "Se modificó correctamente el tutor" },

    ERROR_SERVIDOR
};

export const MAPA_ESTADO_TUTOR: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "CAMBIO_ESTADO_TUTOR_OK": { status: CodigoEstadoHTTP.OK, msg: "Se modificó el estado del tutor correctamente" },

    ERROR_SERVIDOR
};

export const MAPA_LISTAR_TUTORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "TUTOR_LISTED_OK": { status: CodigoEstadoHTTP.OK, msg: "Listado de tutores obtenido correctamente." },

    ERROR_SERVIDOR
};

export const MAPA_LISTAR_SIN_PAGINACION_TUTORES: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "TUTOR_LISTED_OK": { status: CodigoEstadoHTTP.OK, msg: "Listado de tutores obtenido correctamente." },

    ERROR_SERVIDOR
};

export const MAPA_TUTORES_POR_ALUMNO: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    "TUTOR_POR_ALUMNO_OK": { status: CodigoEstadoHTTP.OK, msg: "Tutores del alumno obtenidos correctamente." },

    ERROR_SERVIDOR
};
