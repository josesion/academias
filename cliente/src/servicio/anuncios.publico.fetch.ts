import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

/**
 * Etiqueta de cómo se muestra el aviso: "whatsapp" | "facebook" | "instagram".
 *
 * **No es la dirección de la red**: la real vive en la columna correspondiente
 * de `empresas` (`whatsapp`, `facebook`, `instagram`). Si la empresa no tiene
 * esa red cargada, el botón no se muestra.
 */
export type TipoContacto = "whatsapp" | "facebook" | "instagram";

/**
 * "imagen" | "video".
 *
 * **El servidor nunca lo manda como string desde el cliente**: se deduce del
 * `mimetype` del archivo y se guarda en el INSERT. El front solo lo usa para
 * pintar la miniatura y para filtrar el listado.
 */
export type TipoMedia = "imagen" | "video";

/**
 * Una fila de `anuncios` tal como la devuelve el listado público.
 *
 * `razon_social` viene del JOIN con `empresas` (por eso puede ser `null`). Las
 * fechas llegan como `string` de MySQL o como `Date`, según cómo las serialice
 * el servidor.
 */
export interface FilaAnuncioPublico {
    id_anuncio: number;
    id_empresa: number;
    razon_social: string | null;
    /** Redes de la empresa dueña (columnas de `empresas`, vía el
     *  JOIN). Nullable: si no están cargadas, el botón de contacto
     *  no se muestra (la URL del botón sale de la columna que diga
     *  `tipo_contacto`). */
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    titulo: string;
    descripcion: string;
    tipo_contacto: TipoContacto;
    tipo_media: TipoMedia;
    media_url: string;
    public_id: string;
    fecha_creacion: string | Date;
    fecha_actualizacion: string | Date | null;
}

/**
 * Parámetros del listado público. Solo paginación: **no hay filtros**.
 *
 * El alumno no puede buscar ni filtrar, y el endpoint ni siquiera los acepta
 * (cualquier otro parámetro se descarta en el `.parse()` del servidor).
 */
export interface FiltrosAnunciosPublicosQuery {
    pagina: number;
    limit: number;
}

/**
 * Listado público paginado de anuncios (GET /api/anuncio_lista_publico).
 *
 * Es el que consume la pantalla principal del alumno. Trae todo, del más nuevo
 * al más viejo, sin filtros.
 *
 * Respuestas del servidor:
 * - `ANUNCIO_LISTA_PUBLICO_OK` (200): filas + `paginacion`
 *   `{ pagina, limite, contadorPagina, totalRegistros }`.
 * - `SIN_ANUNCIOS` (**204**): todavía no hay ningún anuncio → lista vacía, no
 *   error. El `apiFetch` lo normaliza a `{ error: false, data: null }`.
 * - `PROHIBIDO` (403): el rol no es `alumno`. El front lo muestra como aviso
 *   rojo del carrusel.
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - Paginación (`pagina`, `limit`).
 * @returns Respuesta estandarizada (`error`, `message`, `code`, `data`, `paginacion`).
 */
export const listaAnunciosPublicos = async (data: FiltrosAnunciosPublicosQuery)
: Promise<ApiResponse<FilaAnuncioPublico[]>> => {

    const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const params = new URLSearchParams();

    params.append("pagina", String(data.pagina));
    params.append("limit", String(data.limit));

    const ruta = `${PAGINA}api/anuncio_lista_publico?${params.toString()}`;

    return await apiFetch<FilaAnuncioPublico[]>(ruta, {
        method: "GET"
    });
};