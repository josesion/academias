import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { InputAnuncioAlta, InputAnuncioMod, ListadoAnuncioParametros } from "../squemas/anuncio";

/**
 * Fila de `anuncios` tal como la devuelve la BD, con el `razon_social` de la
 * empresa dueña (viene del JOIN de los listados, y por eso no se consulta en
 * las escrituras).
 */
export interface FilaAnuncio {
    id_anuncio: number;
    id_empresa: number;
    razon_social: string | null;
    titulo: string;
    descripcion: string;
    tipo_contacto: string;
    tipo_media: string;
    media_url: string;
    public_id: string;
    fecha_creacion: string | Date;
    fecha_actualizacion: string | Date | null;
}

/**
 * Lo que devuelve el alta: los datos con los que se creo. El `id_anuncio` NO va
 * en `datosRetorno`: lo agrega el hook `iudEntidad` con el `insertId` y llega
 * como `id`.
 */
export interface DataAnuncioAltaResult {
    id_empresa: number;
    titulo: string;
    tipo_contacto: string;
    tipo_media: string;
    media_url: string;
}

/** Lo que devuelve la modificacion: solo lo que cambio. */
export interface DataAnuncioModResult {
    id_anuncio: number;
    titulo?: string;
    descripcion?: string;
    tipo_contacto?: string;
    id_empresa?: number;
    media_url?: string;
    public_id?: string;
}

/**
 * Inserta un anuncio nuevo.
 *
 * - `tipo_media` ya viene resuelto por el Servicio (lo dedujo del `mimetype`).
 * - `fecha_creacion` y `fecha_actualizacion` los pone la BD.
 *
 * @param data - Datos ya validados por Zod + la media ya subida a R2.
 * @returns {Promise<TipadoData<DataAnuncioAltaResult & { id?: number }>>} La fila
 *   creada (el hook agrega `id` con el `insertId`), o el error del hook.
 */
const altaAnuncio = async (
    data: InputAnuncioAlta & { tipo_media: string; media_url: string; public_id: string }
): Promise<TipadoData<DataAnuncioAltaResult & { id?: number }>> => {

    const { id_empresa, titulo, descripcion, tipo_contacto, tipo_media, media_url, public_id } = data;

    const sql: string = `INSERT INTO anuncios (
                                id_empresa,
                                titulo,
                                descripcion,
                                tipo_contacto,
                                tipo_media,
                                media_url,
                                public_id
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?);`;

    const valores: unknown[] = [
        id_empresa,
        titulo,
        descripcion,
        tipo_contacto,
        tipo_media,
        media_url,
        public_id,
    ];

    return await iudEntidad<DataAnuncioAltaResult>({
        slqEntidad: sql,
        valores,
        entidad: "ANUNCIO",
        metodo: "CREAR",
        datosRetorno: {
            id_empresa,
            titulo,
            tipo_contacto,
            tipo_media,
            media_url,
        },
    });
};

/**
 * Modifica un anuncio.
 *
 * El `SET` se arma **dinamicamente** con lo que llego: si el PUT vino sin
 * archivo, `tipo_media`, `media_url` y `public_id` quedan fuera del SET y el
 * archivo que ya estaba se conserva. El `WHERE` es unicamente por `id_anuncio`.
 *
 * @param data - Datos ya validados por Zod, con el `SET` armado en `setSql` y sus
 *   valores ya en orden.
 * @returns {Promise<TipadoData<DataAnuncioModResult>>} Lo aplicado, o el error del hook.
 */
const modificarAnuncio = async (
    data: InputAnuncioMod & {
        setSql: string;
        setValores: unknown[];
        media_url?: string;
        public_id?: string;
    }
): Promise<TipadoData<DataAnuncioModResult>> => {

    const { id_anuncio, setSql, setValores } = data;

    const sql: string = `UPDATE anuncios
                         SET ${setSql}
                         WHERE id_anuncio = ?;`;

    const valores: unknown[] = [...setValores, id_anuncio];

    const datosRetorno: DataAnuncioModResult = { id_anuncio };

    if (data.id_empresa !== undefined)    datosRetorno.id_empresa = data.id_empresa;
    if (data.titulo !== undefined)        datosRetorno.titulo = data.titulo;
    if (data.descripcion !== undefined)   datosRetorno.descripcion = data.descripcion;
    if (data.tipo_contacto !== undefined) datosRetorno.tipo_contacto = data.tipo_contacto;
    if (data.media_url !== undefined)     datosRetorno.media_url = data.media_url;
    if (data.public_id !== undefined)     datosRetorno.public_id = data.public_id;

    return await iudEntidad<DataAnuncioModResult>({
        slqEntidad: sql,
        valores,
        entidad: "ANUNCIO",
        metodo: "MODIFICAR",
        datosRetorno,
    });
};

/**
 * Borra un anuncio de la base de datos (baja FISICA, a diferencia de las
 * empresas).
 *
 * El objeto de R2 lo borra el Servicio antes de llamar a esta funcion, y se
 * queda con el `public_id` que devuelve `buscarAnuncioPorId`.
 *
 * @param id_anuncio - Identificador del anuncio a eliminar.
 * @returns {Promise<TipadoData<{ id_anuncio: number }>>} La baja o el error del hook.
 */
const eliminarAnuncio = async (
    id_anuncio: number
): Promise<TipadoData<{ id_anuncio: number }>> => {

    const sql: string = `DELETE FROM anuncios WHERE id_anuncio = ?;`;

    const valores: unknown[] = [id_anuncio];

    return await iudEntidad<{ id_anuncio: number }>({
        slqEntidad: sql,
        valores,
        entidad: "ANUNCIO",
        metodo: "ELIMINAR",
        datosRetorno: { id_anuncio },
    });
};

/**
 * Busca un anuncio por su id.
 *
 * Se consulta ANTES de modificarlo o de borrarlo (para el borrado es
 * imprescindible: de ahi sale el `media_url` que hay que sacar de R2).
 *
 * @param id_anuncio - Identificador del anuncio.
 * @returns {Promise<TipadoData<FilaAnuncio>>} `ANUNCIO_EXISTE` si hay fila /
 *   `ANUNCIO_NO_EXISTE` si ese id no existe.
 */
const buscarAnuncioPorId = async (
    id_anuncio: number
): Promise<TipadoData<FilaAnuncio>> => {

    const sql: string = `SELECT id_anuncio, id_empresa, titulo, descripcion, tipo_contacto,
                                tipo_media, media_url, public_id, fecha_creacion, fecha_actualizacion
                         FROM anuncios
                         WHERE id_anuncio = ?;`;

    const valores: unknown[] = [id_anuncio];

    return await buscarExistenteEntidad<FilaAnuncio>({
        slqEntidad: sql,
        valores,
        entidad: "ANUNCIO",
    });
};

/**
 * Listado paginado de anuncios, del mas nuevo al mas viejo.
 *
 * - El `JOIN` con `empresas` es lo que permite filtrar por `razon_social` (que
 *   es parcial: `LIKE '%texto%'`).
 * - Los 5 filtros se agregan solo si llegaron: sin ninguno la SQL no tiene
 *   `WHERE`.
 * - Usa el hook generico `listarEntidad`, por lo que la SQL trae
 *   `COUNT(*) OVER() AS total_registros` para el calculo de paginacion.
 *
 * @param parametros - Lo validado por Zod en el Servicio mas el `offset` calculado alla.
 * @returns {Promise<TipadoData<FilaAnuncio[]>>} Listado paginado o el error asociado.
 */
const listarAnuncios = async (
    parametros: ListadoAnuncioParametros
): Promise<TipadoData<FilaAnuncio[]>> => {

    const { pagina, limit, offset, razon_social, tipo_media, tipo_contacto, fecha_desde, fecha_hasta } = parametros;

    const condiciones: string[] = [];
    const valores: unknown[] = [];

    if (razon_social !== undefined)   { condiciones.push("e.razon_social LIKE ?"); valores.push(`%${razon_social}%`); }
    if (tipo_media !== undefined)     { condiciones.push("a.tipo_media = ?");     valores.push(tipo_media); }
    if (tipo_contacto !== undefined)  { condiciones.push("a.tipo_contacto = ?");  valores.push(tipo_contacto); }
    if (fecha_desde !== undefined)    { condiciones.push("a.fecha_creacion >= ?"); valores.push(fecha_desde); }
    if (fecha_hasta !== undefined)    { condiciones.push("a.fecha_creacion <= ?"); valores.push(fecha_hasta); }

    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

    const sql: string = `SELECT a.id_anuncio,
                                a.id_empresa,
                                e.razon_social,
                                a.titulo,
                                a.descripcion,
                                a.tipo_contacto,
                                a.tipo_media,
                                a.media_url,
                                a.public_id,
                                a.fecha_creacion,
                                a.fecha_actualizacion,
                                COUNT(*) OVER() AS total_registros
                         FROM anuncios a
                         JOIN empresas e ON a.id_empresa = e.id_empresa
                         ${where}
                         ORDER BY a.fecha_creacion DESC, a.id_anuncio DESC
                         LIMIT ${limit} OFFSET ${offset};`;

    return listarEntidad<FilaAnuncio>({
        slqListado: sql,
        valores,
        entidad: "ANUNCIOS",
        estado: "publicados",
        limit,
        pagina: String(pagina),
    });
};

/**
 * Listado SIN paginacion de todos los anuncios de una empresa, del mas nuevo al
 * mas viejo. Es el listado que muestra "lo que tiene subida esa empresa".
 *
 * @param id_empresa - Empresa cuyos anuncios se quieren traer.
 * @returns {Promise<TipadoData<FilaAnuncio[]>>} Los anuncios o el error asociado.
 */
const listarAnunciosPorEmpresa = async (
    id_empresa: number
): Promise<TipadoData<FilaAnuncio[]>> => {

    const sql: string = `SELECT a.id_anuncio,
                                a.id_empresa,
                                e.razon_social,
                                a.titulo,
                                a.descripcion,
                                a.tipo_contacto,
                                a.tipo_media,
                                a.media_url,
                                a.public_id,
                                a.fecha_creacion,
                                a.fecha_actualizacion
                         FROM anuncios a
                         JOIN empresas e ON a.id_empresa = e.id_empresa
                         WHERE a.id_empresa = ?
                         ORDER BY a.fecha_creacion DESC, a.id_anuncio DESC;`;

    const valores: unknown[] = [id_empresa];

    return listarEntidadSinPaginacion<FilaAnuncio>({
        slqListado: sql,
        valores,
        entidad: "ANUNCIOS",
        estado: "publicados",
    });
};

export const method = {
    altaAnuncio: tryCatchDatos(altaAnuncio),
    modificarAnuncio: tryCatchDatos(modificarAnuncio),
    eliminarAnuncio: tryCatchDatos(eliminarAnuncio),
    buscarAnuncioPorId: tryCatchDatos(buscarAnuncioPorId),
    listarAnuncios: tryCatchDatos(listarAnuncios),
    listarAnunciosPorEmpresa: tryCatchDatos(listarAnunciosPorEmpresa),
};