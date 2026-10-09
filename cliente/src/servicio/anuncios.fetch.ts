import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

/**
 * Etiqueta de cómo se muestra el aviso: "whatsapp" | "facebook" | "instagram".
 *
 * **No es la dirección de la red**: la real vive en la columna correspondiente
 * de `empresas` (`whatsapp`, `facebook`, `instagram`). Si la empresa no tiene
 * esa red cargada, el aviso queda apuntando a una red sin destino.
 */
export type TipoContacto = "whatsapp" | "facebook" | "instagram";

/**
 * "imagen" | "video".
 *
 * **El cliente nunca lo manda**: el Servicio del server lo deduce del
 * `mimetype` del archivo y lo pone en el INSERT. Solo se usa como filtro del
 * listado y para pintar la miniatura.
 */
export type TipoMedia = "imagen" | "video";

/**
 * Una fila de `anuncios` tal como la devuelve el listado.
 *
 * `razon_social` viene del JOIN con `empresas` (por eso el listado hace JOIN y
 * por eso puede ser `null`). Las fechas llegan como `string` de MySQL o como
 * `Date`, según cómo las serialice el server.
 */
export interface FilaAnuncio {
    id_anuncio: number;
    id_empresa: number;
    razon_social: string | null;
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
 * Filtros del listado (van por query string).
 *
 * Los 5 se omiten si llegan vacíos: en `anuncios` no hay ningún `default()` que
 * los llene, así que "sin filtro" y "filtro vacío" son exactamente lo mismo
 * (Zod los deja fuera del WHERE).
 */
export interface FiltrosAnunciosQuery {
    pagina: number;
    limit: number;
    /** Parcial: `LIKE %…%` sobre `empresas.razon_social`. */
    razon_social?: string;
    tipo_media?: TipoMedia;
    tipo_contacto?: TipoContacto;
    /** El server exige el formato exacto `AAAA-MM-DD`. */
    fecha_desde?: string;
    fecha_hasta?: string;
}

/**
 * Listado paginado de anuncios (GET /api/anuncio_lista).
 *
 * Sin filtro trae todo, del más nuevo al más viejo.
 *
 * Respuestas del server:
 * - `ANUNCIO_LISTA_OK` (200): filas + `paginacion`.
 * - `SIN_ANUNCIOS` (**204**): no hay anuncios para ese filtro → lista vacía,
 *   no error (el server lo manda sin cuerpo y `apiFetch` lo normaliza a
 *   `{ error: false, data: null }`).
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - Paginación y filtros opcionales.
 * @returns Respuesta estandarizada (`error`, `message`, `code`, `data`, `paginacion`).
 */
export const listaAnuncios = async (data: FiltrosAnunciosQuery)
: Promise<ApiResponse<FilaAnuncio[]>> => {

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
    if (data.razon_social) params.append("razon_social", data.razon_social);
    if (data.tipo_media) params.append("tipo_media", data.tipo_media);
    if (data.tipo_contacto) params.append("tipo_contacto", data.tipo_contacto);
    if (data.fecha_desde) params.append("fecha_desde", data.fecha_desde);
    if (data.fecha_hasta) params.append("fecha_hasta", data.fecha_hasta);

    const ruta = `${PAGINA}api/anuncio_lista?${params.toString()}`;

    return await apiFetch<FilaAnuncio[]>(ruta, {
        method: "GET"
    });
};

/**
 * Lo que el front manda al crear un anuncio (POST /api/anuncio_alta).
 *
 * La media es **obligatoria** y viaja como archivo en el campo `media`.
 * `tipo_media` NO se manda (lo deduce el server del `mimetype`) y las fechas
 * las pone la BD.
 */
export interface AnuncioAltaInput {
    id_empresa: number;
    titulo: string;
    descripcion: string;
    tipo_contacto: TipoContacto;
    /** Imagen (JPG/PNG/WEBP hasta 2 MB) o video (MP4/WEBM/MOV hasta 50 MB). */
    media: File;
}

/**
 * Alta de anuncio (POST /api/anuncio_alta).
 *
 * **multipart/form-data** (`uploadAnuncio.single("media")`): el `apiFetch`
 * detecta el `FormData` y no pone `Content-Type`, para que el navegador arme el
 * `boundary` solo.
 *
 * `id_empresa` es la excepción al multi-tenant (como el `id_escuela` del alta de
 * cuentas): lo elige el administrador y es el que decide de qué empresa es el
 * aviso.
 *
 * Respuestas del server:
 * - `ANUNCIO_ALTA_OK` (200).
 * - `MEDIA_AUSENTE` / `FORMATO_MEDIA_INVALIDO` / `TAMANO_MEDIA_INVALIDO` (400).
 * - `EMPRESA_NO_ENCONTRADA` (404): el `id_empresa` no existe.
 * - `ERROR_SUBIR_MEDIA` (500) / `NOT_AUTHENTICATED` (401).
 *
 * @param data - Datos del anuncio y su archivo de media.
 * @returns Respuesta estandarizada.
 */
export const postAnuncio = async (data: AnuncioAltaInput)
: Promise<ApiResponse<FilaAnuncio>> => {

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

    const formData = new FormData();

    formData.append("id_empresa", String(data.id_empresa));
    formData.append("titulo", data.titulo);
    formData.append("descripcion", data.descripcion);
    formData.append("tipo_contacto", data.tipo_contacto);
    formData.append("media", data.media);

    const ruta = `${PAGINA}api/anuncio_alta`;

    return await apiFetch<FilaAnuncio>(ruta, {
        method: "POST",
        body: formData
    });
};

/**
 * Lo que el front manda al modificar un anuncio (PUT /api/anuncio_mod).
 *
 * Todos los campos son opcionales **menos `id_anuncio`**, igual que en el
 * schema del server: lo que no llega, no se modifica (el `SET` se arma
 * dinámico).
 *
 * - `media` es **opcional**: si no viene un archivo, el server conserva el
 *   `public_id` y la `media_url` actuales.
 * - `cambia_media` NO se manda: lo pone el controlador cuando detecta el
 *   archivo, y es lo que permite que el `.refine()` del schema acepte un PUT
 *   que solo cambia la media.
 */
export interface AnuncioModInput {
    id_anuncio: number;
    id_empresa?: number;
    titulo?: string;
    descripcion?: string;
    tipo_contacto?: TipoContacto;
    /** Si no viene (o es `null`), la media actual se conserva. */
    media?: File | null;
}

/**
 * Modificación de anuncio (PUT /api/anuncio_mod).
 *
 * También multipart. Cada campo se manda **solo si viene**: si se mandaran
 * siempre, no habría forma de dejar de modificar uno.
 *
 * Respuestas del server:
 * - `ANUNCIO_MOD_OK` (200).
 * - `ANUNCIO_NO_ENCONTRADO` / `MODIFICAR_NOT_FOUND` (404).
 * - `EMPRESA_NO_ENCONTRADA` (404).
 * - `FORMATO_MEDIA_INVALIDO` / `TAMANO_MEDIA_INVALIDO` (400). Ojo:
 *   `MEDIA_AUSENTE` **no** puede aparecer acá, porque en el PUT la media es
 *   opcional.
 * - `ERROR_SUBIR_MEDIA` (500) / `NOT_AUTHENTICATED` (401).
 *
 * @param data - `id_anuncio` y los campos a cambiar (los que no vengan, no se tocan).
 * @returns Respuesta estandarizada.
 */
export const putAnuncio = async (data: AnuncioModInput)
: Promise<ApiResponse<FilaAnuncio>> => {

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

    const formData = new FormData();

    formData.append("id_anuncio", String(data.id_anuncio));
    // Cada campo solo si viene: `undefined` = no se manda = el server no lo toca
    if (data.id_empresa !== undefined) formData.append("id_empresa", String(data.id_empresa));
    if (data.titulo !== undefined) formData.append("titulo", data.titulo);
    if (data.descripcion !== undefined) formData.append("descripcion", data.descripcion);
    if (data.tipo_contacto !== undefined) formData.append("tipo_contacto", data.tipo_contacto);
    // Solo si viene archivo: si no, el FormData viaja sin este campo y el
    // controlador deja `cambia_media` en false.
    if (data.media) formData.append("media", data.media);

    const ruta = `${PAGINA}api/anuncio_mod`;

    return await apiFetch<FilaAnuncio>(ruta, {
        method: "PUT",
        body: formData
    });
};

/**
 * Lo que el front manda al borrar un anuncio: solo el id.
 *
 * El id viaja en el **body**, no en la URL (los dos `DELETE` que ya había en
 * el cliente lo mandan en el path).
 */
export interface AnuncioBajaInput {
    id_anuncio: number;
}

/**
 * Baja **FÍSICA** de anuncio (DELETE /api/anuncio_baja): borra la fila **y el
 * objeto de R2**. No hay vuelta atrás, por eso la UI lo pide con confirmación.
 *
 * `apiFetch` pasa el body por `JSON.stringify` con `Content-Type:
 * application/json`, y el `express.json()` global del server lo parsea también
 * en un DELETE.
 *
 * Respuestas del server:
 * - `ANUNCIO_BAJA_OK` (200).
 * - `ANUNCIO_NO_ENCONTRADO` / `ELIMINAR_NOT_FOUND` (404): pasa si ya se había
 *   borrado.
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - `id_anuncio` de la fila a borrar.
 * @returns Respuesta estandarizada.
 */
export const deleteAnuncio = async (data: AnuncioBajaInput)
: Promise<ApiResponse<AnuncioBajaInput>> => {

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

    const ruta = `${PAGINA}api/anuncio_baja`;

    return await apiFetch<AnuncioBajaInput>(ruta, {
        method: "DELETE",
        body: data
    });
};

/**
 * Listado **sin paginar** de los anuncios de una empresa
 * (GET /api/anuncio_lista_empresa).
 *
 * Es el que se usa al hacer click en una fila del listado de empresas, para ver
 * qué avisos tiene esa empresa.
 *
 * Respuestas del server:
 * - `ANUNCIO_LISTA_EMPRESA_OK` (200): filas, **sin `paginacion`** (por eso el
 *   `useEffectServicio` de la pantalla de empresas no le pasa `accionPaginacion`).
 * - `SIN_ANUNCIOS` (**204**): la empresa no tiene anuncios → lista vacía.
 *
 * @param id_empresa - Empresa cuyos anuncios se quieren ver.
 * @returns Respuesta estandarizada con las filas.
 */
export const listaAnunciosEmpresa = async (id_empresa: number)
: Promise<ApiResponse<FilaAnuncio[]>> => {

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

    const ruta = `${PAGINA}api/anuncio_lista_empresa?id_empresa=${id_empresa}`;

    return await apiFetch<FilaAnuncio[]>(ruta, {
        method: "GET"
    });
};