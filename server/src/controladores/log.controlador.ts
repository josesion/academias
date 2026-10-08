import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioLog } from "../Servicio/log.servicios";

import { MAPA_LISTAR_LOG_EVENTOS, MAPA_MARCAR_LOG_EVENTOS } from "../respuestas/logs";

import { ListadoLogEventosQuery, InputMarcarLogEventos } from "../squemas/log";
import { FilaLogEventos } from "../data/log.data";

/**
 * Controlador del listado de eventos (`GET /api/logs_eventos`).
 *
 * Arma el objeto tipado campo por campo desde `req.query`. Los filtros que no
 * llegaron quedan en `undefined` y Zod los deja fuera del `WHERE`; los que
 * lleguen en un valor inválido hacen fallar el `.parse()` del Servicio (400).
 *
 * @param req - Petición de Express: paginación y filtros opcionales en `req.query`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listar = async ( req : Request , res : Response ) : Promise<void> => {

    const data : ListadoLogEventosQuery = {
        pagina     : req.query.pagina     ? Number(req.query.pagina)     : 1,
        limit      : req.query.limit      ? Number(req.query.limit)      : 6,
        nivel      : typeof req.query.nivel      === "string" ? req.query.nivel      : undefined,
        origen     : typeof req.query.origen     === "string" ? req.query.origen     : undefined,
        ruta       : typeof req.query.ruta       === "string" ? req.query.ruta       : undefined,
        resuelto   : req.query.resuelto   !== undefined ? Number(req.query.resuelto)   : undefined,
        fecha_desde: typeof req.query.fecha_desde === "string" ? req.query.fecha_desde : undefined
    };

    await handleControladores<ListadoLogEventosQuery, FilaLogEventos[]>(
        res, data, servicioLog.listar, MAPA_LISTAR_LOG_EVENTOS
    );
};

/**
 * Controlador para marcar un evento como revisado (`PUT /api/logs_eventos_marcar`).
 *
 * Arma el objeto tipado campo por campo desde `req.body` (mismo patrón que el
 * resto del proyecto). La ruta no tiene `:id`: el identificador viaja en el body.
 *
 * @param req - Petición de Express: `id_log` y `resuelto` en `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const marcar = async ( req : Request , res : Response ) : Promise<void> => {

    const data : InputMarcarLogEventos = {
        id_log  : Number(req.body.id_log),
        resuelto: Number(req.body.resuelto)
    };

    await handleControladores<InputMarcarLogEventos, InputMarcarLogEventos>(
        res, data, servicioLog.marcar, MAPA_MARCAR_LOG_EVENTOS
    );
};

export const method = {
    listar : tryCatch( listar ),
    marcar : tryCatch( marcar )
};
