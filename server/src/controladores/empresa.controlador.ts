import { Request, Response } from "express";

import { method as servicioEmpresa } from "../Servicio/empresa.servicios";
import type { EmpresaAltaRetorno, EmpresaModRetorno } from "../Servicio/empresa.servicios";

import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import {
    MAPA_EMPRESA_ALTA, MAPA_EMPRESA_MOD, MAPA_EMPRESA_BAJA, MAPA_EMPRESA_LISTA,
} from "../respuestas/empresas";

import { InputEmpresaBaja, ListadoEmpresaQuery } from "../squemas/empresa";
import { FilaEmpresa } from "../data/empresa.data";

/**
 * Convierte el `req.file` de multer en el payload que espera el Servicio.
 *
 * Devuelve `undefined` cuando no vino archivo: el logo es **opcional** en el
 * alta y en la modificacion.
 *
 * @param file - El archivo que dejo `upload.single("logo")` en la peticion.
 * @returns El archivo mapeado o `undefined`.
 */
const leerLogo = (file?: Express.Multer.File) => {
    if (!file) return undefined;

    return {
        buffer: file.buffer,
        tipo: file.mimetype,
        size: file.size,
        nombre: file.originalname,
    };
};

/**
 * Controlador del alta de empresa (`POST /api/empresa_alta`).
 *
 * Arma el payload campo por campo desde `req.body`. Las redes sociales viajan
 * tal cual: el Servicio las normaliza a `NULL` cuando llegan vacias.
 *
 * @param req - Peticion de Express: los datos en `req.body` y el logo en `req.file`.
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
            razon_social: body.razon_social,
            domicilio: body.domicilio,
            whatsapp: body.whatsapp,
            instagram: body.instagram,
            facebook: body.facebook,
        },
        logo: leerLogo(req.file),
    };

    await handleControladores<typeof data, EmpresaAltaRetorno>(
        res, data, servicioEmpresa.altaEmpresa, MAPA_EMPRESA_ALTA
    );
};

/**
 * Controlador de la modificacion de empresa (`PUT /api/empresa_mod`).
 *
 * El `id_empresa` viaja en el body (esta ruta no tiene `:id`) y se castea con
 * `Number`. Los demas campos son opcionales: lo que no llega, el Servicio no lo
 * toca. Mandar `estado: "activos"` sobre una empresa dada de baja la reactiva.
 *
 * @param req - Peticion de Express: los datos en `req.body` y el logo en `req.file`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const actualizar = async (req: Request, res: Response): Promise<void> => {

    const body = req.body ?? {};

    const logo = leerLogo(req.file);

    const data = {
        id_empresa: Number(body.id_empresa),
        dataTabla: {
            razon_social: body.razon_social,
            domicilio: body.domicilio,
            whatsapp: body.whatsapp,
            instagram: body.instagram,
            facebook: body.facebook,
            estado: body.estado,
            cambia_logo: logo !== undefined,
        },
        logo,
    };

    await handleControladores<typeof data, EmpresaModRetorno>(
        res, data, servicioEmpresa.modificarEmpresa, MAPA_EMPRESA_MOD
    );
};

/**
 * Controlador de la baja logica de empresa (`DELETE /api/empresa_baja`).
 *
 * Solo viaja `id_empresa`: el estado destino lo pone el backend
 * (`'inactivos'`), nunca el cliente.
 *
 * @param req - Peticion de Express: `id_empresa` en `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const eliminar = async (req: Request, res: Response): Promise<void> => {

    const data: InputEmpresaBaja = {
        id_empresa: Number((req.body ?? {}).id_empresa),
    };

    await handleControladores<InputEmpresaBaja, InputEmpresaBaja>(
        res, data, servicioEmpresa.bajaEmpresa, MAPA_EMPRESA_BAJA
    );
};

/**
 * Controlador del listado paginado de empresas (`GET /api/empresa_lista`).
 *
 * Sin `estado` el listado trae solo las activas. La razon social se busca
 * parcial (`LIKE '%texto%'`), asi que llega como texto y el `.parse()` del
 * Servicio se encarga del resto.
 *
 * @param req - Peticion de Express: la query con `pagina`, `limit`, `razon_social` y `estado`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listar = async (req: Request, res: Response): Promise<void> => {

    const data: ListadoEmpresaQuery = {
        pagina: req.query.pagina !== undefined ? Number(req.query.pagina) : 1,
        limit: req.query.limit !== undefined ? Number(req.query.limit) : 10,
        razon_social: typeof req.query.razon_social === "string" ? req.query.razon_social : undefined,
        estado: typeof req.query.estado === "string" ? req.query.estado : undefined,
    };

    await handleControladores<ListadoEmpresaQuery, FilaEmpresa[]>(
        res, data, servicioEmpresa.listarEmpresas, MAPA_EMPRESA_LISTA
    );
};

export const method = {
    crear: tryCatch(crear),
    actualizar: tryCatch(actualizar),
    eliminar: tryCatch(eliminar),
    listar: tryCatch(listar),
};