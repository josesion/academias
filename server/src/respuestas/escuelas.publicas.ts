import { CodigoEstadoHTTP } from "../tipados/generico";

const ERROR_SERVIDOR = {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error interno de servidor, intente nuevamente."
} as const;

/**
 * Traducción a HTTP de los códigos del listado público de escuelas (spec 054).
 *
 * - `LISTADO_ESCUELAS_PUBLICAS_OK`: hay escuelas activas.
 * - `LISTADO_ESCUELAS_PUBLICAS_VACIO`: no hay escuelas activas. **También es
 *   `200`**: `handleControladores` solo considera éxito el `200`, y un
 *   catálogo vacío no es un error.
 * - `ERROR_SERVIDOR`: fallo inesperado de la capa data (`500`).
 */
export const MAPA_ESCUELAS_PUBLICAS: Record<string, { status: CodigoEstadoHTTP, msg: string }> = {

    ERROR_SERVIDOR,

    "LISTADO_ESCUELAS_PUBLICAS_OK": {
        status: CodigoEstadoHTTP.OK,
        msg: "Listado de escuelas públicas obtenido correctamente."
    },

    "LISTADO_ESCUELAS_PUBLICAS_VACIO": {
        status: CodigoEstadoHTTP.OK,
        msg: "Todavía no hay escuelas publicadas."
    }

};
