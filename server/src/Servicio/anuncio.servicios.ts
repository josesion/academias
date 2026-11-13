import { tryCatchDatos } from "../utils/tryCatchBD";
import { subirImagenR2, eliminarImagenR2 } from "../utils/subirImagen";

import { method as dataAnuncio, FilaAnuncio } from "../data/anuncio.data";
import { method as dataEmpresa } from "../data/empresa.data";

import { TipadoData } from "../tipados/tipado.data";
import {
    EsquemaAnuncioAlta, EsquemaAnuncioMod, EsquemaAnuncioBaja,
    EsquemaAnuncioLista, EsquemaAnuncioListaEmpresa, EsquemaAnuncioListaPublico, EsquemaMediaAnuncio,
    InputAnuncioAlta, InputAnuncioMod, InputAnuncioBaja,
    ListadoAnuncioInput, ListadoAnuncioEmpresaInput,
    ListadoAnuncioPublicoInput, ListadoAnuncioPublicoParametros,
    ListadoAnuncioParametros,
    MediaAnuncioArchivo, MediaAnuncioInput,
} from "../squemas/anuncio";

/** Lo que devuelve el alta. */
export interface AnuncioAltaRetorno {
    id_anuncio: number;
    id_empresa: number;
    titulo: string;
    descripcion: string;
    tipo_contacto: string;
    tipo_media: string;
    media_url: string;
}

/** Lo que devuelve la modificacion. */
export interface AnuncioModRetorno {
    id_anuncio: number;
    id_empresa?: number;
    titulo?: string;
    descripcion?: string;
    tipo_contacto?: string;
    media_url?: string;
    public_id?: string;
}

/** Lo que devuelve la baja. */
export interface AnuncioBajaRetorno {
    id_anuncio: number;
}

/** Payload del alta y del PUT: datos de la tabla + el archivo de `req.file`. */
interface AnuncioConMedia {
    dataTabla: Record<string, unknown>;
    media?: MediaAnuncioArchivo;
}

/** Formatos de imagen aceptados (los mismos que flyers). */
const FORMATOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

/** Formatos de video aceptados: mp4 (mpeg4), webm y quicktime (.mov). */
const FORMATOS_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

/** Topes reales por tipo. El de multer (50 MB) es el techo absoluto, no este. */
const TAMANO_MAX_IMAGEN = 2 * 1024 * 1024;
const TAMANO_MAX_VIDEO = 50 * 1024 * 1024;

/** Carpeta del bucket de R2 donde viven los anuncios. */
const CARPETA_ANUNCIOS = "anuncios/";

/**
 * Deduce el `tipo_media` a partir del `mimetype` y valida el formato y el tope
 * de tamano de ese tipo.
 *
 * Los topes se validan ACA y no en multer a proposito: un `MulterError`
 * (`LIMIT_FILE_SIZE`) o un `new Error` del `fileFilter` salen por `next()`,
 * caen en el handler global de `app.ts` y responden 500. Con el corte en el
 * Servicio se responde 400 con codigo propio.
 *
 * @param media - El archivo que llego en `req.file`.
 * @returns {{ tipoMedia: string } | { error: string }} El tipo deducido o el
 *   codigo de error (`FORMATO_MEDIA_INVALIDO` / `TAMANO_MEDIA_INVALIDO`).
 */
const clasificarMedia = (
    media: MediaAnuncioInput
): { tipoMedia: string; error?: undefined } | { tipoMedia?: undefined; error: string } => {

    if (FORMATOS_IMAGEN.includes(media.tipo)) {
        if (media.size > TAMANO_MAX_IMAGEN) return { error: "TAMANO_MEDIA_INVALIDO" };
        return { tipoMedia: "imagen" };
    }

    if (FORMATOS_VIDEO.includes(media.tipo)) {
        if (media.size > TAMANO_MAX_VIDEO) return { error: "TAMANO_MEDIA_INVALIDO" };
        return { tipoMedia: "video" };
    }

    return { error: "FORMATO_MEDIA_INVALIDO" };
};

/**
 * Sube la media de un anuncio a Cloudflare R2.
 *
 * @param media - El archivo ya clasificado y validado.
 * @returns {Promise<{ url: string; key: string }>} La URL publica y la key del bucket.
 */
const subirMedia = async (media: MediaAnuncioInput): Promise<{ url: string; key: string }> => {

    const key = await subirImagenR2(media.buffer, media.nombre, media.tipo, CARPETA_ANUNCIOS);

    return { url: `${process.env.R2_PUBLIC_URL}/${key}`, key };
};

/**
 * Crea un anuncio.
 *
 * 1. El archivo es obligatorio: sin `req.file` responde 400 `MEDIA_AUSENTE`
 *    (a diferencia de `flayer.controlador.ts`, que hace un `return` mudo y deja
 *    la peticion sin respuesta).
 * 2. Deduce `tipo_media` del `mimetype` y valida el tope de ese tipo.
 * 3. Valida los datos con Zod.
 * 4. Verifica que la empresa exista: si no, 404 (y no un 500 por FK).
 * 5. Sube a R2 en `anuncios/` e inserta. Si el INSERT falla despues de subir,
 *    borra el objeto huerfano.
 *
 * @param data - Los datos del formulario y el archivo (obligatorio).
 * @returns {Promise<TipadoData<AnuncioAltaRetorno>>} `ANUNCIO_ALTA_OK` (200) o el error.
 */
const altaAnuncio = async (data: AnuncioConMedia): Promise<TipadoData<AnuncioAltaRetorno>> => {

    const { dataTabla, media } = data;

    // 1. El archivo es obligatorio
    if (!media) {
        return { error: true, message: "Debe adjuntar una imagen o un video.", code: "MEDIA_AUSENTE" };
    }

    // 2. Formato y tamano (segun el mimetype, que define el tipo)
    let mediaValidada: MediaAnuncioInput;

    try {
        mediaValidada = EsquemaMediaAnuncio.parse(media);
    } catch {
        return { error: true, message: "El archivo no es valido.", code: "FORMATO_MEDIA_INVALIDO" };
    }

    const clasificacion = clasificarMedia(mediaValidada);

    if (clasificacion.error === "FORMATO_MEDIA_INVALIDO") {
        return {
            error: true,
            message: "Formato no permitido. Imagenes: JPG, PNG o WEBP. Videos: MP4, WEBM o MOV.",
            code: "FORMATO_MEDIA_INVALIDO",
        };
    }

    if (clasificacion.error === "TAMANO_MEDIA_INVALIDO") {
        // El tope depende del tipo, y el tipo lo define el mimetype: si es video
        // van 50 MB y si es imagen, 2 MB.
        const esVideo = FORMATOS_VIDEO.includes(mediaValidada.tipo);
        const tope = esVideo ? "50 MB" : "2 MB";

        return {
            error: true,
            message: `El archivo no puede superar los ${tope}.`,
            code: "TAMANO_MEDIA_INVALIDO",
        };
    }

    const tipoMedia = clasificacion.tipoMedia as string;

    // 3. Zod sobre los datos de la tabla
    const validado: InputAnuncioAlta = EsquemaAnuncioAlta.parse(dataTabla);

    // 4. La empresa tiene que existir (si no, la FK daria 500)
    const empresa = await dataEmpresa.buscarEmpresaPorId(validado.id_empresa);

    if (empresa.code === "EMPRESA_NO_EXISTE") {
        return { error: true, message: "No existe una empresa con ese id.", code: "EMPRESA_NO_ENCONTRADA" };
    }

    // 5. Subida a R2
    let media_url: string;
    let public_id: string;

    try {
        const subido = await subirMedia(mediaValidada);
        media_url = subido.url;
        public_id = subido.key;
    } catch {
        return { error: true, message: "No se pudo subir el archivo.", code: "ERROR_SUBIR_MEDIA" };
    }

    // 6. Insercion
    const resultado = await dataAnuncio.altaAnuncio({
        ...validado,
        tipo_media: tipoMedia,
        media_url,
        public_id,
    });

    if (resultado.code === "ANUNCIO_CREAR") {
        return {
            error: false,
            message: "Anuncio creado correctamente.",
            data: {
                id_anuncio: Number(resultado.data?.id),
                id_empresa: validado.id_empresa,
                titulo: validado.titulo,
                descripcion: validado.descripcion,
                tipo_contacto: validado.tipo_contacto,
                tipo_media: tipoMedia,
                media_url,
            },
            code: "ANUNCIO_ALTA_OK",
        };
    }

    // El archivo quedo en R2 pero no hay fila que lo referencie.
    await eliminarImagenR2(media_url);

    return { error: true, message: "Error en el servidor , crear anuncio.", code: "ERROR_SERVIDOR" };
};

/**
 * Modifica un anuncio. **El archivo es opcional**: si no viene, `tipo_media`,
 * `media_url` y `public_id` quedan fuera del SET y se conserva lo que habia.
 *
 * 1. Si viene archivo: valida formato y tamano, lo sube y armamos el SET con la
 *    media nueva.
 * 2. Valida los datos con Zod (el `.refine()` ya garantiza al menos un campo).
 * 3. Verifica que el anuncio exista (404) y que la empresa destino exista.
 * 4. Despues de guardar, borra el objeto viejo de R2.
 *
 * @param data - Los datos del formulario y el archivo opcional.
 * @returns {Promise<TipadoData<AnuncioModRetorno>>} `ANUNCIO_MOD_OK` (200) o el error.
 */
const modificarAnuncio = async (
    data: AnuncioConMedia & { id_anuncio: number }
): Promise<TipadoData<AnuncioModRetorno>> => {

    const { media, id_anuncio } = data;
    // `cambia_media` viaja al `.parse()` a proposito: el `.refine()` del esquema
    // lo necesita para saber que reemplazar la media ES un cambio. No es una
    // columna, asi que el SET (que se arma campo por campo) nunca lo incluye.
    const { id_anuncio: _id, ...campos } = data.dataTabla;

    // 1. Media (opcional)
    let mediaValidada: MediaAnuncioInput | undefined;
    let tipoMedia: string | undefined;

    if (media) {
        try {
            mediaValidada = EsquemaMediaAnuncio.parse(media);
        } catch {
            return { error: true, message: "El archivo no es valido.", code: "FORMATO_MEDIA_INVALIDO" };
        }

        const clasificacion = clasificarMedia(mediaValidada);

        if (clasificacion.error) {
            const mensaje = clasificacion.error === "FORMATO_MEDIA_INVALIDO"
                ? "Formato no permitido. Imagenes: JPG, PNG o WEBP. Videos: MP4, WEBM o MOV."
                : FORMATOS_VIDEO.includes(mediaValidada.tipo)
                    ? "El archivo no puede superar los 50 MB."
                    : "El archivo no puede superar los 2 MB.";

            return { error: true, message: mensaje, code: clasificacion.error };
        }

        tipoMedia = clasificacion.tipoMedia;
    }

    // 2. Zod
    const validado: InputAnuncioMod = EsquemaAnuncioMod.parse({ ...campos, id_anuncio });

    // 3. El anuncio tiene que existir (y de ahi sale el public_id viejo)
    const existente = await dataAnuncio.buscarAnuncioPorId(id_anuncio);

    if (existente.code === "ANUNCIO_NO_EXISTE") {
        return { error: true, message: "No existe un anuncio con ese id.", code: "ANUNCIO_NO_ENCONTRADO" };
    }

    // Si se cambia de empresa, la nueva tambien tiene que existir.
    if (validado.id_empresa !== undefined) {
        const empresa = await dataEmpresa.buscarEmpresaPorId(validado.id_empresa);

        if (empresa.code === "EMPRESA_NO_EXISTE") {
            return { error: true, message: "No existe una empresa con ese id.", code: "EMPRESA_NO_ENCONTRADA" };
        }
    }

    // 4. SET dinamico: solo las columnas que llegaron
    const columnas: string[] = [];
    const valores: unknown[] = [];

    if (validado.id_empresa !== undefined)    { columnas.push("id_empresa = ?");    valores.push(validado.id_empresa); }
    if (validado.titulo !== undefined)        { columnas.push("titulo = ?");        valores.push(validado.titulo); }
    if (validado.descripcion !== undefined)   { columnas.push("descripcion = ?");   valores.push(validado.descripcion); }
    if (validado.tipo_contacto !== undefined) { columnas.push("tipo_contacto = ?"); valores.push(validado.tipo_contacto); }

    let media_url: string | undefined;
    let public_id: string | undefined;
    const mediaAnterior = existente.data?.media_url ?? null;

    if (mediaValidada && tipoMedia) {
        try {
            const subido = await subirMedia(mediaValidada);
            media_url = subido.url;
            public_id = subido.key;
            columnas.push("tipo_media = ?"); valores.push(tipoMedia);
            columnas.push("media_url = ?");  valores.push(media_url);
            columnas.push("public_id = ?");  valores.push(public_id);
        } catch {
            return { error: true, message: "No se pudo subir el archivo.", code: "ERROR_SUBIR_MEDIA" };
        }
    }

    const resultado = await dataAnuncio.modificarAnuncio({
        ...validado,
        setSql: columnas.join(", "),
        setValores: valores,
    });

    if (resultado.code === "ANUNCIO_MODIFICAR") {
        // El objeto viejo se borra recien cuando el nuevo ya esta guardado.
        if (media_url && mediaAnterior) {
            await eliminarImagenR2(mediaAnterior);
        }

        return {
            error: false,
            message: "Anuncio modificado correctamente.",
            data: resultado.data as AnuncioModRetorno,
            code: "ANUNCIO_MOD_OK",
        };
    }

    // El archivo nuevo quedo huerfano.
    if (media_url) {
        await eliminarImagenR2(media_url);
    }

    return { error: true, message: "Error en el servidor , modificar anuncio.", code: "ERROR_SERVIDOR" };
};

/**
 * Da de baja un anuncio de forma FISICA: borra el objeto de Cloudflare R2 y la
 * fila de la tabla.
 *
 * Si el borrado de R2 falla se loguea y **igual** se borra la fila: es preferible
 * una fila sin archivo que un archivo que ya no referencia nadie.
 *
 * @param data - `{ id_anuncio }` del body del DELETE.
 * @returns {Promise<TipadoData<AnuncioBajaRetorno>>} `ANUNCIO_BAJA_OK` (200) o
 *   `ANUNCIO_NO_ENCONTRADO` (404).
 */
const bajaAnuncio = async (data: InputAnuncioBaja): Promise<TipadoData<AnuncioBajaRetorno>> => {

    const validado = EsquemaAnuncioBaja.parse(data);

    const existente = await dataAnuncio.buscarAnuncioPorId(validado.id_anuncio);

    if (existente.code === "ANUNCIO_NO_EXISTE") {
        return { error: true, message: "No existe un anuncio con ese id.", code: "ANUNCIO_NO_ENCONTRADO" };
    }

    const url = existente.data?.media_url;

    if (url) {
        try {
            await eliminarImagenR2(url);
        } catch {
            // No corta la baja: el objeto huerfano se limpia a mano en R2.
            console.error(`[anuncio] No se pudo borrar de R2 el objeto del anuncio ${validado.id_anuncio}`);
        }
    }

    const resultado = await dataAnuncio.eliminarAnuncio(validado.id_anuncio);

    if (resultado.code === "ANUNCIO_ELIMINAR") {
        return {
            error: false,
            message: "Anuncio eliminado correctamente.",
            data: { id_anuncio: validado.id_anuncio },
            code: "ANUNCIO_BAJA_OK",
        };
    }

    return { error: true, message: "Error en el servidor , baja de anuncio.", code: "ERROR_SERVIDOR" };
};

/**
 * Listado paginado de anuncios, con los 5 filtros (razon_social parcial,
 * tipo_media, tipo_contacto, fecha_desde y fecha_hasta).
 *
 * @param data - Query de la peticion.
 * @returns {Promise<TipadoData<FilaAnuncio[]>>} `ANUNCIO_LISTA_OK` (200) o
 *   `SIN_ANUNCIOS` (204).
 */
const listarAnuncios = async (data: ListadoAnuncioInput): Promise<TipadoData<FilaAnuncio[]>> => {

    const base = EsquemaAnuncioLista.parse(data);

    const parametros: ListadoAnuncioParametros = { ...base, offset: (base.pagina - 1) * base.limit };

    const resultado = await dataAnuncio.listarAnuncios(parametros);

    if (resultado.code === "ANUNCIOS_LISTED") {
        return {
            error: false,
            message: "Listado de anuncios.",
            data: resultado.data,
            paginacion: resultado.paginacion,
            code: "ANUNCIO_LISTA_OK",
        };
    }

    if (resultado.code === "NO_ACTIVE_ANUNCIOS") {
        return { error: true, message: "Sin anuncios para mostrar.", code: "SIN_ANUNCIOS" };
    }

    return { error: true, message: "Error en el servidor , listar anuncios.", code: "ERROR_SERVIDOR" };
};

/**
 * Listado SIN paginacion de todos los anuncios de una empresa: es el listado
 * que muestra los datos y la media de lo que tiene subido.
 *
 * @param data - `{ id_empresa }` de la query (obligatorio).
 * @returns {Promise<TipadoData<FilaAnuncio[]>>} `ANUNCIO_LISTA_EMPRESA_OK` (200) o
 *   `SIN_ANUNCIOS` (204).
 */
const listarAnunciosPorEmpresa = async (
    data: ListadoAnuncioEmpresaInput
): Promise<TipadoData<FilaAnuncio[]>> => {

    const validado = EsquemaAnuncioListaEmpresa.parse(data);

    const resultado = await dataAnuncio.listarAnunciosPorEmpresa(validado.id_empresa);

    if (resultado.code === "ANUNCIOS_LISTED") {
        return {
            error: false,
            message: "Anuncios de la empresa.",
            data: resultado.data,
            code: "ANUNCIO_LISTA_EMPRESA_OK",
        };
    }

    if (resultado.code === "NO_ACTIVE_ANUNCIOS") {
        return { error: true, message: "Sin anuncios para mostrar.", code: "SIN_ANUNCIOS" };
    }

    return { error: true, message: "Error en el servidor , listar anuncios de la empresa.", code: "ERROR_SERVIDOR" };
};

/**
 * Listado PUBLICO de anuncios: el que ve el alumno en su pantalla principal.
 *
 * 1. Valida la query con `EsquemaAnuncioListaPublico` (Zod vive solo en esta
 *    capa). El schema NO tiene filtros: el frontend del alumno solo pagina, y
 *    cualquier otro parametro que mande se descarta en el `.parse()`.
 * 2. Calcula el `offset` y consulta la data.
 *
 * Es una funcion separada de `listarAnuncios` (el del administrador) porque
 * aunque comparta la SQL, no comparten las reglas: el publico no filtra y el
 * del administrador si. Asi se pueden cambiar por separado.
 *
 * @param data - Query de la peticion (`pagina`, `limit`).
 * @returns {Promise<TipadoData<FilaAnuncio[]>>} `ANUNCIO_LISTA_PUBLICO_OK` (200) o
 *   `SIN_ANUNCIOS` (204).
 */
const listarPublico = async (data: ListadoAnuncioPublicoInput): Promise<TipadoData<FilaAnuncio[]>> => {

    const base = EsquemaAnuncioListaPublico.parse(data);

    const parametros: ListadoAnuncioPublicoParametros = { ...base, offset: (base.pagina - 1) * base.limit };

    const resultado = await dataAnuncio.listarPublico(parametros);

    if (resultado.code === "ANUNCIOS_LISTED") {
        return {
            error: false,
            message: "Listado de anuncios.",
            data: resultado.data,
            paginacion: resultado.paginacion,
            code: "ANUNCIO_LISTA_PUBLICO_OK",
        };
    }

    if (resultado.code === "NO_ACTIVE_ANUNCIOS") {
        return { error: true, message: "Sin anuncios para mostrar.", code: "SIN_ANUNCIOS" };
    }

    return { error: true, message: "Error en el servidor , listar anuncios.", code: "ERROR_SERVIDOR" };
};

export const method = {
    altaAnuncio: tryCatchDatos(altaAnuncio),
    modificarAnuncio: tryCatchDatos(modificarAnuncio),
    bajaAnuncio: tryCatchDatos(bajaAnuncio),
    listarAnuncios: tryCatchDatos(listarAnuncios),
    listarAnunciosPorEmpresa: tryCatchDatos(listarAnunciosPorEmpresa),
    listarPublico: tryCatchDatos(listarPublico),
};