import { Request, Response } from "express";

import { method as servicioAnuncio } from "../Servicio/anuncio.servicios";
import type { AnuncioAltaRetorno, AnuncioModRetorno, AnuncioBajaRetorno } from "../Servicio/anuncio.servicios";

import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import {
    MAPA_ANUNCIO_ALTA, MAPA_ANUNCIO_MOD, MAPA_ANUNCIO_BAJA,
    MAPA_ANUNCIO_LISTA, MAPA_ANUNCIO_LISTA_EMPRESA, MAPA_ANUNCIO_LISTA_PUBLICO,
} from "../respuestas/anuncios";

import { InputAnuncioBaja, ListadoAnuncioQuery } from "../squemas/anuncio";
import { FilaAnuncio } from "../data/anuncio.data";

/**
 * Convierte el `req.file` de multer en el payload que espera el Servicio.
 *
 * En el alta el archivo es **obligatorio** y el Servicio responde
 * `MEDIA_AUSENTE` si no llega; en la modificacion es opcional.
 *
 * @param file - El archivo que dejo `uploadAnuncio.single("media")` en la peticion.
 * @returns El archivo mapeado o `undefined`.
 */
const leerMedia = (file?: Express.Multer.File) => {
    if (!file) return undefined;

    return {
        buffer: file.buffer,
        tipo: file.mimetype,
        size: file.size,
        nombre: file.originalname,
    };
};

/**
 * Controlador del alta de anuncio (`POST /api/anuncio_alta`).
 *
 * `id_empresa` SI viaja del body (el administrador elige a que empresa pertenece
 * el anuncio): es la excepcion al multi-tenant, igual que el `id_escuela` de
 * `POST /api/usuario_admin_alta`. El `tipo_media` no se manda: lo deduce el
 * Servicio del `mimetype`.
 *
 * @param req - Peticion de Express: los datos en `req.body` y la media en `req.file`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const crear = async (req: Request, res: Response): Promise<void> => {

    // Express 5 deja `req.body` en `undefined` cuando la peticion no trae un body
    // parseable (un POST sin `Content-Type`, por ejemplo), y `req.body.x` seria
    // un TypeError -> 500. Con `?? {}` eso cae en el `.parse()` de Zod -> 400.
    const body = req.body ?? {};

    const data = {
        dataTabla: {
            id_empresa: Number(body.id_empresa),
            titulo: body.titulo,
            descripcion: body.descripcion,
            tipo_contacto: body.tipo_contacto,
        },
        media: leerMedia(req.file),
    };

    await handleControladores<typeof data, AnuncioAltaRetorno>(
        res, data, servicioAnuncio.altaAnuncio, MAPA_ANUNCIO_ALTA
    );
};

/**
 * Controlador de la modificacion de anuncio (`PUT /api/anuncio_mod`).
 *
 * La media es **opcional**: si no llega, el Servicio arma el SET sin las columnas
 * de la media y el archivo que ya estaba se conserva. Si llega, se sube el
 * nuevo y el Servicio borra el anterior de R2.
 *
 * @param req - Peticion de Express: los datos en `req.body` y la media en `req.file`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const actualizar = async (req: Request, res: Response): Promise<void> => {

    const body = req.body ?? {};

    const media = leerMedia(req.file);

    const data = {
        id_anuncio: Number(body.id_anuncio),
        dataTabla: {
            id_empresa: body.id_empresa !== undefined ? Number(body.id_empresa) : undefined,
            titulo: body.titulo,
            descripcion: body.descripcion,
            tipo_contacto: body.tipo_contacto,
            cambia_media: media !== undefined,
        },
        media,
    };

    await handleControladores<typeof data, AnuncioModRetorno>(
        res, data, servicioAnuncio.modificarAnuncio, MAPA_ANUNCIO_MOD
    );
};

/**
 * Controlador de la baja de anuncio (`DELETE /api/anuncio_baja`).
 *
 * La baja es FISICA: el Servicio borra el objeto de Cloudflare R2 y la fila.
 *
 * @param req - Peticion de Express: `id_anuncio` en `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const eliminar = async (req: Request, res: Response): Promise<void> => {

    const data: InputAnuncioBaja = {
        id_anuncio: Number((req.body ?? {}).id_anuncio),
    };

    await handleControladores<InputAnuncioBaja, AnuncioBajaRetorno>(
        res, data, servicioAnuncio.bajaAnuncio, MAPA_ANUNCIO_BAJA
    );
};

/**
 * Controlador del listado paginado de anuncios (`GET /api/anuncio_lista`).
 *
 * Los 5 filtros viajan opcionales en la query. `tipo_media` y `tipo_contacto`
 * llegan como texto y el `.parse()` del Servicio corta con 400 si el valor no
 * esta en la lista.
 *
 * @param req - Peticion de Express: la query con paginacion y filtros.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listar = async (req: Request, res: Response): Promise<void> => {

    const data: ListadoAnuncioQuery = {
        pagina: req.query.pagina !== undefined ? Number(req.query.pagina) : 1,
        limit: req.query.limit !== undefined ? Number(req.query.limit) : 10,
        razon_social: typeof req.query.razon_social === "string" ? req.query.razon_social : undefined,
        tipo_media: typeof req.query.tipo_media === "string" ? req.query.tipo_media : undefined,
        tipo_contacto: typeof req.query.tipo_contacto === "string" ? req.query.tipo_contacto : undefined,
        fecha_desde: typeof req.query.fecha_desde === "string" ? req.query.fecha_desde : undefined,
        fecha_hasta: typeof req.query.fecha_hasta === "string" ? req.query.fecha_hasta : undefined,
    };

    await handleControladores<ListadoAnuncioQuery, FilaAnuncio[]>(
        res, data, servicioAnuncio.listarAnuncios, MAPA_ANUNCIO_LISTA
    );
};

/**
 * Controlador del listado por empresa (`GET /api/anuncio_lista_empresa`).
 *
 * Sin paginacion: trae todos los anuncios de esa empresa con sus datos y su
 * media, del mas nuevo al mas viejo. `id_empresa` es obligatorio.
 *
 * @param req - Peticion de Express: `id_empresa` en la query.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listarPorEmpresa = async (req: Request, res: Response): Promise<void> => {

    const data = {
        id_empresa: Number(req.query.id_empresa),
    };

    await handleControladores<typeof data, FilaAnuncio[]>(
        res, data, servicioAnuncio.listarAnunciosPorEmpresa, MAPA_ANUNCIO_LISTA_EMPRESA
    );
};

/**
 * Controlador del listado PUBLICO (`GET /api/anuncio_lista_publico`).
 *
 * El que consume la pantalla principal del alumno. A diferencia del listado del
 * administrador, aca NO se leen filtros de la query: solo `pagina` y `limit`.
 * Un alumno no puede buscar ni filtrar, y cualquier otro parametro que mande se
 * descarta en el `.parse()` del Servicio en vez de llegar a la SQL.
 *
 * @param req - Peticion de Express: `pagina` y `limit` opcionales en `req.query`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listarPublico = async (req: Request, res: Response): Promise<void> => {

    const data = {
        pagina: req.query.pagina !== undefined ? Number(req.query.pagina) : 1,
        limit: req.query.limit !== undefined ? Number(req.query.limit) : 10,
    };

    await handleControladores<typeof data, FilaAnuncio[]>(
        res, data, servicioAnuncio.listarPublico, MAPA_ANUNCIO_LISTA_PUBLICO
    );
};

export const method = {
    crear: tryCatch(crear),
    actualizar: tryCatch(actualizar),
    eliminar: tryCatch(eliminar),
    listar: tryCatch(listar),
    listarPorEmpresa: tryCatch(listarPorEmpresa),
    listarPublico: tryCatch(listarPublico),
};