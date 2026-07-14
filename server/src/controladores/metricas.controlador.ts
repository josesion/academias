import { Request , Response } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { ResultClase,  ResultAsistencia } from "../data/metricas.data";
import { ResultTarjetas } from "../Servicio/metricas.servicio";

import { method as servicioMetrica } from "../Servicio/metricas.servicio";
import { MAPA_METRICAS_TARJETAS,
         MAPA_METRICAS_CLASES, MAPA_METRICAS_ASISTENCIAS
 } from "../respuestas/metricas";

/**
 * Controlador para la obtención de las métricas de inscripción de la escuela.
 * * * Extrae el `id_escuela` desde la información del usuario autenticado en la request
 * y delega la ejecución del servicio y el mapeo de respuesta al `handleControladores`.
 * * @param {Request} req - Objeto de solicitud de Express que contiene el usuario autenticado.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Promesa que resuelve una vez procesada la respuesta HTTP.
 * * @example
 * // Uso interno vía el wrapper tryCatch:
 * method.metricaInscripcion(req, res);
 */
const metricaInscripcion = async( req : Request , res : Response ) => {
    
    const data = { id_escuela : req.usuario?.id_escuela || 0 };

    await handleControladores<{ id_escuela : number }, ResultTarjetas >( 
        res, data , servicioMetrica.metricasInscripcion , MAPA_METRICAS_TARJETAS    
    );
};

/**
 * Controlador para la obtención de los datos del encabezado de la clase actual.
 * * Extrae el `id_escuela` del usuario autenticado en la request para consultar la 
 * clase activa en el servicio de métricas y devuelve la respuesta formateada.
 * * @param {Request} req - Objeto de solicitud de Express que contiene los datos del usuario.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Promesa que resuelve tras enviar la respuesta HTTP al cliente.
 */
const encabezadoClases = async ( req : Request , res : Response ) =>{

    const data = { id_escuela : req.usuario?.id_escuela || 0};

    await handleControladores<{ id_escuela : number }, ResultClase >(
        res, data , servicioMetrica.encabezadoClases , MAPA_METRICAS_CLASES
    );
};


/**
 * Controlador para la obtención del reporte de asistencia a clases.
 * * Extrae el `id_escuela` desde la información del usuario autenticado y delega
 * la ejecución al servicio de métricas, retornando un listado con el estado de asistencia.
 * * @param {Request} req - Objeto de solicitud de Express que contiene los datos del usuario.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Promesa que resuelve tras enviar el listado de asistencias al cliente.
 */
const asistenciaClases = async (  req : Request , res : Response  ) =>{
    
     const data = { id_escuela : req.usuario?.id_escuela || 0 };
     
     await  handleControladores<{ id_escuela : number }, ResultAsistencia[] >(
        res, data  , servicioMetrica.asistenciaClases ,MAPA_METRICAS_ASISTENCIAS
     ); 
};


export const method = {
    metricaInscripcion : tryCatch( metricaInscripcion ),
    encabezadoClases   : tryCatch( encabezadoClases),
    asistenciaClases   : tryCatch( asistenciaClases )
};