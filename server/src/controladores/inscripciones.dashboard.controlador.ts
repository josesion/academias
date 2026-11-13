import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Capa de servicio para el dashboard de inscripciones.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionesDashboardServicio } from "../Servicio/inscripciones.dashboard.servicio";

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

// ──────────────────────────────────────────────────────────────
// Sección de Respuestas
// ──────────────────────────────────────────────────────────────
import { MAPA_DASHBOARD_INSCRIPCIONES } from "../respuestas/inscripciones";

/**
 * Controlador de Express para manejar la petición HTTP del dashboard de inscripciones.
 * Extrae los parámetros de la URL (query strings), invoca el servicio
 * y devuelve una respuesta estandarizada al cliente.
 *
 * @async
 * @function inscripcionesDashboard
 * @param {Request} req - Objeto de petición de Express.
 * Se esperan en req.query: filtro ("por_vencer" | "ultimas" | "todos"), limit (número).
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP usando handleControladores.
 */
const inscripcionesDashboard = async (req: Request, res: Response) => {
    const id_escuela = req.usuario?.id_escuela;

    const filtro = (req.query.filtro as string) || "todos";
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const dataDashboard = {
        id_escuela: Number(id_escuela),
        filtro,
        limit
    };

    await handleControladores(
        res,
        dataDashboard,
        inscripcionesDashboardServicio.inscripcionesDashboardServicio,
        MAPA_DASHBOARD_INSCRIPCIONES
    );
};

export const method = {
    inscripcionesDashboard: tryCatch(inscripcionesDashboard)
};
