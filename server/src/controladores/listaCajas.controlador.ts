import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";


import { MAPA_HISTORIAL_CAJAS } from "../respuestas/listaCajas";
import { method as listaCajaServicios } from "../Servicio/listaCaja.servicios";
import { InputConvinados } from "../squemas/listaCajas";
import { CajasServicioResponse } from "../data/listaCajas.data";


/**
 * Controlador de Express para gestionar el listado y métricas del historial de cajas.
 * Extrae y normaliza los parámetros de la petición (filtros de usuario, diferencias de caja, 
 * rango de fechas y paginación), construye el objeto de entrada tipado y delega 
 * la ejecución al manejador centralizado de controladores.
 *
 * @async
 * @function estadoListaCaja
 * @param {Request} req - Objeto de petición HTTP de Express (contiene `req.query` con los filtros y `req.usuario`).
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que responde a la petición HTTP 
 *          mediante el manejador `handleControladores`.
 * 
 * @throws {Error} Puede propagar errores si el servicio o el manejador de controladores fallan.
 * 
 * @example
 * // Petición GET esperada:
 * // /api/cajas/historial?id=2&fechaD=2026-04-01&fechaH=2026-04-30&pagina=1&estado=exacta
 */
const estadoListaCaja = async( req : Request , res : Response) => {
    const { id, fechaD, fechaH, pagina, estado } = req.query;

    const limiteSetting : number = 15;    
   
    const offset : number = ( Number(pagina) -1 ) * Number(limiteSetting) ;

    const idUsuarioFiltro = (id && id !== 'null' && id !== 'undefined' && !isNaN(Number(id))) 
        ? Number(id) 
        : null;

    const estadoFinal  = (  estado === "exacta" ||  estado === "con_diferencia" )   
        ? estado
        : null


    const data : InputConvinados = { 
        id_escuela : Number(req.usuario?.id_escuela),
        idUsuarioFiltro : idUsuarioFiltro,
        estadoDiferencia : estadoFinal as "exacta" | "con_diferencia" | null,
        fechaDesde : String(fechaD),
        fechaHasta : String(fechaH),
        limit : limiteSetting  ,
        pagina : Number(pagina),
        offset : offset
    };

    await handleControladores<InputConvinados,CajasServicioResponse >(
        res, data , listaCajaServicios.listaCajasServicio, MAPA_HISTORIAL_CAJAS
    );    
};

export const method = {
    estadoListaCaja : tryCatch(estadoListaCaja)
}   