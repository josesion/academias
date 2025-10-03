import { Request, Response } from "express";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";

import { method as planesData } from "../data/planes.data";
import { CrearInputsPlanes, crearPlanesSchema, ModInputsPlanes, modPlanesSchema, ListaInputsPlanes , listaPlanesSchema } from "../squemas/planes";
/**
 * Controlador para crear un nuevo plan.
 *
 * Valida los datos del cuerpo de la solicitud usando `crearPlanesSchema`,
 * luego delega la creación al servicio `planesData.crearPlan` y envía una
 * respuesta estándar con `enviarResponse`.
 *
 * @param {Request} req - Objeto de solicitud HTTP de Express.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 *
 * @returns {Promise<Response>} Respuesta HTTP con el resultado de la operación.
 *
 * @example
 * POST /api/planes
 * {
 *   "descripcion": "Plan Avanzado",
 *   "limites_cedes": 10,
 *   "precio_mensual": 250,
 *   "estado": true
 * }
 */

const crearPlane = async (req: Request, res: Response) => {
    const planData : CrearInputsPlanes = crearPlanesSchema.parse(req.body);    
    const resultado = await planesData.crearPlan(planData);
    return enviarResponse(res, 201, resultado.message, resultado.data, undefined ,resultado.code);
}

/**
 * Controlador para modificar un plan existente.
 *
 * Valida el cuerpo de la solicitud con `modPlanesSchema`, llama a `planesData.modPlanes`
 * y responde con el resultado utilizando `enviarResponse`.
 *
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} Respuesta con los datos del plan modificado.
 *
 * @example
 * PUT /api/planes/3
 * {
 *   "descripcion": "Plan Empresarial",
 *   "limites_cedes": 12,
 *   "precio_mensual": 310,
 *   "estado": true
 * }
 */

const modPlanes = async( req : Request , res : Response) =>{
    const { id } = req.params;
    const idPlanes = Number(id)
    const { descripcion , limites_cedes , precio_mensual , estado} = req.body ;
    const planDataMod : ModInputsPlanes = modPlanesSchema.parse({id : idPlanes, descripcion,limites_cedes,precio_mensual, estado});
    const resultado = await planesData.modPlanes( planDataMod );
    return enviarResponse(res, 200 , resultado.message , resultado.data , undefined ,resultado.code);
}

/**
 * Controlador para listar planes con filtros y paginación.
 *
 * Extrae los datos de `query`, `params` y `body`, calcula el `offset`, valida los datos con `listaPlanesSchema`,
 * y llama a `planesData.listarPlanes`. Luego responde con la lista paginada usando `enviarResponse`.
 *
 * @param {Request} req - Objeto de solicitud HTTP.
 * @param {Response} res - Objeto de respuesta HTTP.
 *
 * @returns {Promise<Response>} Respuesta con los planes listados y datos de paginación.
 *
 * @example
 * GET api/planes_listar?estado=activos&orden=descripcion&descripcion=plan&limit=10&pagina=4
 * 
 */

const listarPlanes = async( req : Request, res : Response) =>{    
    const { estado,orden, descripcion, limit , pagina } = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limit) ;
    //console.log("offset :" +  offset ,  "pagina :" + pagina, "limit :"+ limit ) 
    const dataResult : ListaInputsPlanes = listaPlanesSchema.parse({
        estado, orden, descripcion ,limit :Number(limit) , offset: Number(offset)
    }); 
    const listado =  await planesData.listarPlanes( dataResult , Number(pagina));
    return enviarResponse(res , 200 , listado.message , listado.data, listado.paginacion ,listado.code);
}


export const method = {
    crearPlane      : tryCatch( crearPlane ),
    modPlanes       : tryCatch( modPlanes ),
    listarPlanes    : tryCatch( listarPlanes ),
}