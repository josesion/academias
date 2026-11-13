import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error interno de servidor , intente nuevamente"
} as const;

/**
 * El hook `iudEntidad` lanza un `ClientError` 404 con este codigo cuando el
 * UPDATE afecta 0 filas. En la baja logica pasa cuando se da de baja dos veces
 * la misma empresa (el `WHERE` filtra por `estado = 'activos'`). Sin esta entrada
 * el `map[result.code]` caeria en `ERROR_SERVIDOR` con el mensaje crudo del hook.
 */
const NO_ENCONTRADA = {
    status: CodigoEstadoHTTP.NO_ENCONTRADO,
    msg: "No existe una empresa con ese id.",
} as const;

/** Alta de empresa (POST /api/empresa_alta). */
export const MAPA_EMPRESA_ALTA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "EMPRESA_ALTA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Empresa creada correctamente.",
    },

    "FORMATO_LOGO_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El formato del logo no esta permitido. Solo JPG, PNG o WEBP.",
    },

    "TAMANO_LOGO_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El logo no puede superar los 2 MB.",
    },

    "ERROR_SUBIR_LOGO": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir el logo.",
    },
};

/** Modificacion de empresa (PUT /api/empresa_mod). */
export const MAPA_EMPRESA_MOD: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "EMPRESA_MOD_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Empresa modificada correctamente.",
    },

    "EMPRESA_NO_ENCONTRADA": NO_ENCONTRADA,
    "MODIFICAR_NOT_FOUND": NO_ENCONTRADA,

    "FORMATO_LOGO_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El formato del logo no esta permitido. Solo JPG, PNG o WEBP.",
    },

    "TAMANO_LOGO_INVALIDO": {
        status: CodigoEstadoHTTP.SOLICITUD_INCORRECTA,
        msg: "El logo no puede superar los 2 MB.",
    },

    "ERROR_SUBIR_LOGO": {
        status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        msg: "No se pudo subir el logo.",
    },
};

/** Baja logica de empresa (DELETE /api/empresa_baja). */
export const MAPA_EMPRESA_BAJA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "EMPRESA_BAJA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Empresa dada de baja correctamente.",
    },

    "EMPRESA_NO_ENCONTRADA": NO_ENCONTRADA,
    "MODIFICAR_NOT_FOUND": NO_ENCONTRADA,
};

/** Listado paginado de empresas (GET /api/empresa_lista). */
export const MAPA_EMPRESA_LISTA: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {

    ERROR_SERVIDOR,

    "EMPRESA_LISTA_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de empresas.",
    },

    // 204 y NO 404: "no hay empresas para ese filtro" no es un error.
    "SIN_EMPRESAS": {
        status: CodigoEstadoHTTP.SIN_CONTENIDO,
        msg: "Sin empresas para mostrar.",
    },
};