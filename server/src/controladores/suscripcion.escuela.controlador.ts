import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { generarFechasSuscripcion } from "../utils/fechasSuscripcion";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioSuspcripcion } from "../Servicio/suscripcion.escuela.servicios";

import { SuscripcionInputs, FiltrosSuscripcionesInputs, AnularSuscripcionInputs } from "../squemas/suscripciones.escuela";
import { MAPA_POST_SUSCRIPCION, MAPA_GET_SUSCRIPCION, MAPA_GET_ESC_PLAN, MAPA_ANULAR_SUSCRIPCION, MAPA_METRICAS_SIMPLES } from "../respuestas/suscripcion.escuela";
import { SuscripcionEscuelaDto, SuscripcionEstadoDto, MetricasSimples } from "../data/suscripcion.escuela.data";
import { EscPlanDTO } from "../Servicio/suscripcion.escuela.servicios";

const postSuscripcion = async ( req : Request , res : Response) =>{
    
    const {  fecha_inscripcion, fecha_vencimiento} = generarFechasSuscripcion();

    const data : SuscripcionInputs = {
        id_escuela : Number(req.body.id_escuela),
        id_plan_saas : Number(req.body.id_plan_saas),
        fecha_inscripcion : fecha_inscripcion ,
        fecha_vencimiento : fecha_vencimiento,
        estado : "activo"
    };

    await handleControladores< SuscripcionInputs, {}>(
        res, data , servicioSuspcripcion.postSuscripcion, MAPA_POST_SUSCRIPCION
    );
};


const getSupcripcion = async (req : Request , res : Response) =>{

    const data : FiltrosSuscripcionesInputs = {
        razon_social: typeof req.query.razon_social === "string" ? req.query.razon_social : undefined,
        id_plan_saas: typeof req.query.id_plan_saas === "string" ? req.query.id_plan_saas : undefined,
        fecha_inscripcion: typeof req.query.fecha_inscripcion === "string" ? req.query.fecha_inscripcion : undefined,
        estado: typeof req.query.estado === "string" ? req.query.estado : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        pagina: Number(req.query.pagina )
    };

    await handleControladores<FiltrosSuscripcionesInputs, SuscripcionEscuelaDto[]>(
        res, data, servicioSuspcripcion.getSuspcripciones, MAPA_GET_SUSCRIPCION 
    );
};    


/**
 * Devuelve los dos arreglos del formulario de suscripciones: escuelas
 * activas (id + razón social) y planes SaaS activos (id + descripción).
 * No recibe parámetros: todo el trabajo lo hace el servicio.
 *
 * @param __req - Request de Express (sin uso).
 * @param res - Response de Express.
 */
const getEscPlan = async (__req : Request , res : Response) : Promise<void> =>{

    await handleControladores<{}, EscPlanDTO>(
        res, {}, servicioSuspcripcion.getEscPlan, MAPA_GET_ESC_PLAN
    );
};


/**
 * Anula una suscripción: toma el id de la URL y deja el estado en "anulado"
 * (el estado no viaja en la ruta, es una acción única).
 *
 * @param req - Request de Express (se lee `req.params.id`).
 * @param res - Response de Express.
 */
const anularSuscripcion = async ( req : Request , res : Response) : Promise<void> =>{

    const data : AnularSuscripcionInputs = {
        id_suscripcion : Number(req.params.id)
    };

    await handleControladores<AnularSuscripcionInputs, SuscripcionEstadoDto>(
        res, data, servicioSuspcripcion.anularSuscripcion, MAPA_ANULAR_SUSCRIPCION
    );
};


/**
 * Controlador de las métricas simples del administrador (alcance global): suscripciones
 * por vencer, suscripciones vencidas, plata del mes (sin anuladas) y suscripciones
 * vigentes. No lee parámetros de la request.
 *
 * @param __req - Request de Express (sin uso: la métrica es global).
 * @param res - Response de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const metricasSimples = async ( __req : Request , res : Response) : Promise<void> =>{

    await handleControladores<{}, MetricasSimples>(
        res, {}, servicioSuspcripcion.metricasSimples, MAPA_METRICAS_SIMPLES
    );
};


export const method = {
    postSuscripcion : tryCatch( postSuscripcion ),
    getSupcripcion  : tryCatch( getSupcripcion ),
    getEscPlan      : tryCatch( getEscPlan ),
    anularSuscripcion : tryCatch( anularSuscripcion ),
    metricasSimples : tryCatch( metricasSimples )
}