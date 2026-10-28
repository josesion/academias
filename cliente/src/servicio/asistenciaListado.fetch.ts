import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

import type {
    AsistenciaListadoItem,
    FiltroListadoAsistencias
} from "../tipadosTs/asistenciaListado.typado";

/**
 * Filtros que el backend acepta como opcionales: si vienen vacíos (`""`) se
 * omiten de la query. `desde` y `hasta` **no** están acá porque son
 * obligatorios y siempre viajan.
 */
const FILTROS_OPCIONALES = [
    "dia_semana",
    "hora",
    "dni_profesor",
    "id_nivel",
    "id_tipo_clase"
] as const;

/**
 * Listado paginado de asistencias de la escuela del token (spec 048).
 *
 * `GET /api/lista_asistencias?desde=…&hasta=…&…`
 *
 * - `desde` y `hasta` son **obligatorios** (el backend responde 400 si faltan).
 * - Los cinco filtros opcionales se omiten cuando vienen vacíos, así el
 *   backend recibe exactamente lo mismo que si se mandaran en blanco (los
 *   convierte en `null` de todos modos).
 * - Un rango sin datos **no** es un error: responde 200 con `data: []` y
 *   `contadorPagina: 0`.
 * - Sólo el rol `usuario` puede llamarlo (403 `PROHIBIDO` para el resto).
 *
 * @param {FiltroListadoAsistencias} filtros - Filtros del formulario.
 * @param {AbortSignal} [signal] - Señal para cancelar la petición.
 * @returns {Promise<ApiResponse<AsistenciaListadoItem[]>>} Filas + `paginacion`
 *   (`pagina`, `limite`, `contadorPagina`, `totalRegistros`).
 */
export const listadoAsistencias = async (
    filtros : FiltroListadoAsistencias,
    signal? : AbortSignal
) : Promise<ApiResponse<AsistenciaListadoItem[]>> => {

    const verificarUser = await verificarAutenticacion();
    if ( verificarUser.autenticado === false ) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

    const parametros = new URLSearchParams();

    // Obligatorios: el backend los valida con Zod.
    parametros.append( "desde", filtros.desde );
    parametros.append( "hasta", filtros.hasta );

    for ( const campo of FILTROS_OPCIONALES ) {
        const valor = filtros[campo];
        if ( valor ) parametros.append( campo, valor );
    };

    parametros.append( "pagina", String( filtros.pagina ) );
    parametros.append( "limit", String( filtros.limit ) );

    const ruta = `${PAGINA}api/lista_asistencias?${parametros.toString()}`;

    return await apiFetch( ruta, {
        method : "GET",
        signal
    });
};
