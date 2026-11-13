import { Request, Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioEscuelasPublicas } from "../Servicio/escuelas.publicas.servicio";
import { MAPA_ESCUELAS_PUBLICAS } from "../respuestas/escuelas.publicas";
import { EscuelaPublicaRow } from "../tipados/escuela.publica.tipado";

/**
 * Handler del listado público de escuelas (`GET /api/escuelas_publicas`).
 *
 * La ruta no recibe `params`, `query` ni `body`, así que no hay datos que
 * armar: se delega en el servicio con un objeto vacío y se responde con
 * `handleControladores` + `MAPA_ESCUELAS_PUBLICAS`.
 *
 * @param _req - No se usa (`noUnusedParameters` exige el guión bajo).
 * @param res - Respuesta de Express.
 */
const listarEscuelasPublicas = async (_req: Request, res: Response): Promise<void> => {

    await handleControladores<Record<string, never>, EscuelaPublicaRow[]>(
        res,
        {},
        servicioEscuelasPublicas.listarEscuelasPublicas,
        MAPA_ESCUELAS_PUBLICAS
    );

};

/**
 * Colección de métodos del controlador del listado público de escuelas.
 */
export const method = {
    listarEscuelasPublicas: tryCatch(listarEscuelasPublicas)
};
