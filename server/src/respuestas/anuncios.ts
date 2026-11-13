import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error interno de servidor , intente nuevamente"
} as const;

/**
 * El hook `iudEntidad` lanza un `ClientError` 404 con estos codigos cuando el
 * INSERT/UPDATE/DELETE afecta 0 filas (por ejemplo, dar de baja dos veces el
 * mismo anuncio). Sin esta entrada el `map[result.code]` caeria en
 * `ERROR_INTERNO_SERVIDOR` y el mensaje seria el crudo del hook.
 */
const NO_ENCONTRADO = {
    status: CodigoEstadoHTTP.NO_ENCONTRADO,
    msg: "No existe un anuncio con ese id.",
} as const;

/** Alta de anuncio (POST /api/anuncio_alta). */
export const MAPA_ANUNCIO_ALTA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_ALTA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Anuncio creado correctamente.",
    },

    "EMPRESA_NO_ENCONTRADA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No existe una empresa con ese id.",
    },

    "MEDIA_AUSENTE": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "Debe adjuntar una imagen o un video.",
    },

    "FORMATO_MEDIA_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "Formato no permitido. Imagenes: JPG, PNG o WEBP. Videos: MP4, WEBM o MOV.",
    },

    "TAMANO_MEDIA_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El archivo supera el tamano maximo permitido.",
    },

    "ERROR_SUBIR_MEDIA": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir el archivo.",
    },
};

/** Modificacion de anuncio (PUT /api/anuncio_mod). */
export const MAPA_ANUNCIO_MOD: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_MOD_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Anuncio modificado correctamente.",
    },

    "ANUNCIO_NO_ENCONTRADO": NO_ENCONTRADO,

    // 404 del hook `iudEntidad` cuando el UPDATE afecta 0 filas.
    "MODIFICAR_NOT_FOUND": NO_ENCONTRADO,

    "EMPRESA_NO_ENCONTRADA": {
        status: CodigoEstadoHTTP.NO_ENCONTRADO,
        msg: "No existe una empresa con ese id.",
    },

    "FORMATO_MEDIA_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "Formato no permitido. Imagenes: JPG, PNG o WEBP. Videos: MP4, WEBM o MOV.",
    },

    "TAMANO_MEDIA_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El archivo supera el tamano maximo permitido.",
    },

    "ERROR_SUBIR_MEDIA": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir el archivo.",
    },
};

/** Baja fisica de anuncio (DELETE /api/anuncio_baja). */
export const MAPA_ANUNCIO_BAJA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_BAJA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Anuncio eliminado correctamente.",
    },

    "ANUNCIO_NO_ENCONTRADO": NO_ENCONTRADO,

    // 404 del hook `iudEntidad` cuando el DELETE afecta 0 filas.
    "ELIMINAR_NOT_FOUND": NO_ENCONTRADO,
};

/** Listado paginado de anuncios (GET /api/anuncio_lista). */
export const MAPA_ANUNCIO_LISTA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_LISTA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de anuncios.",
    },

    // 204 y NO 404: "no hay anuncios para ese filtro" no es un error.
    "SIN_ANUNCIOS": {
        status: CodigoEstadoHTTP.SIN_CONTENIDO,
        msg: "Sin anuncios para mostrar.",
    },
};

/** Listado por empresa, sin paginacion (GET /api/anuncio_lista_empresa). */
export const MAPA_ANUNCIO_LISTA_EMPRESA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_LISTA_EMPRESA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Anuncios de la empresa.",
    },

    "SIN_ANUNCIOS": {
        status: CodigoEstadoHTTP.SIN_CONTENIDO,
        msg: "Sin anuncios para mostrar.",
    },
};

/** Listado PUBLICO, paginado (GET /api/anuncio_lista_publico). Solo rol alumno. */
export const MAPA_ANUNCIO_LISTA_PUBLICO: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "ANUNCIO_LISTA_PUBLICO_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de anuncios.",
    },

    // 204 y NO 404: "no hay anuncios" no es un error. Es lo que ve un alumno
    // cuando el administrador todavia no publico ninguno.
    "SIN_ANUNCIOS": {
        status: CodigoEstadoHTTP.SIN_CONTENIDO,
        msg: "Sin anuncios para mostrar.",
    },
};