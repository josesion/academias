import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioHistorial } from "../Servicio/historial.servicio";

import type{  ResultPostHistorial, ResultHistorial } from "../data/historial.data";
import { HistorialInputs, GetHistorialInputs} from "../squemas/historial";
import { MAPA_HISTORIAL_POST, MAPA_HISTORIAL, } from "../respuestas/historial";

/**
 * Controlador para la obtención del historial de actividades.
 * 
 * Extrae el `id_escuela` directamente del usuario autenticado en el objeto `req` 
 * y delega la ejecución de la lógica al servicio `servicioHistorial.getHistorialServicio`.
 *
 * @async
 * @function getHistorial
 * @param {Request} req - Objeto de petición de Express. Debe contener la propiedad `usuario` (inyectada por el middleware de autenticación) con el `id_escuela`.
 * @param {Response} res - Objeto de respuesta de Express.
 * 
 * @returns {void} Envía la respuesta HTTP al cliente utilizando la función `handleControladores`.
 * 
 * @example
 * // GET /api/historial
 * // El controlador recupera el id_escuela del token y devuelve el historial correspondiente.
 */
const getHistorial = async (req : Request , res : Response ) =>{
    const data : GetHistorialInputs = { id_escuela : Number(req.usuario?.id_escuela)};

    handleControladores<GetHistorialInputs, ResultHistorial[] >(
        res, data, servicioHistorial.getHistorialServicio, MAPA_HISTORIAL
    );
};

/**
 * Controlador para el registro de nuevas acciones en el historial.
 * 
 * Recolecta la información del contexto de sesión (ID de escuela y usuario) 
 * junto con los datos de la acción enviados en el cuerpo de la petición (`req.body`).
 * Posteriormente, delega el procesamiento al servicio `servicioHistorial.postHistorialServicio`.
 *
 * @async
 * @function postHistorial
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.body - Cuerpo de la petición que debe incluir `modulo`, `accion`, `id_registro`, `descripcion` y `datos`.
 * @param {Response} res - Objeto de respuesta de Express.
 * 
 * @returns {void} Envía la respuesta HTTP al cliente utilizando la función `handleControladores`.
 * 
 * @example
 * // POST /api/historial
 * // Body: { modulo: 'ASISTENCIA', accion: 'EDITAR', ... }
 */
const postHistorial = async (req : Request , res : Response ) =>{

    const data : HistorialInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id),

        modulo: req.body.modulo,
        accion: req.body.accion,
        id_registro: req.body.id_registro,
        descripcion: req.body.descripcion,
        datos: req.body.datos

    };

    await handleControladores<HistorialInputs, ResultPostHistorial>(
        res, data, servicioHistorial.postHistorialServicio, MAPA_HISTORIAL_POST
    );
};


export const method = {
    getHistorial : tryCatch( getHistorial ),
    postHistorial : tryCatch( postHistorial ),
};