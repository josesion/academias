import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";


import { MAPA_HISTORIAL_CAJAS, MAPA_HISTORIAL_ESTADO_CAJAS } from "../respuestas/listaCajas";
import { method as listaCajaServicios } from "../Servicio/listaCaja.servicios";
import { InputConvinados, EstadoCajaInput } from "../squemas/listaCajas";
import { CajasServicioResponse, DataEstadoResult } from "../data/listaCajas.data";



/**
 * Controlador de Express para gestionar y obtener de forma exclusiva el estado actual 
 * de la caja de la escuela (para el encabezado o panel principal).
 * Extrae el ID de la escuela desde la sesión del usuario (`req.usuario`) y delega 
 * la ejecución al manejador centralizado de controladores.
 *
 * @async
 * @function encabezadoHistorialCaja
 * @param {Request} req - Objeto de petición HTTP de Express (contiene los datos del usuario autenticado en `req.usuario`).
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna valor, responde directamente al cliente mediante `handleControladores`.
 * 
 * @example
 * // Petición GET esperada al endpoint asociado:
 * // /api/cajas/estado-actual
 */
const encabezadoHistorialCaja  = async (req : Request , res : Response) =>{

    const data = { id_escuela : Number(req.usuario?.id_escuela)};

    await handleControladores<EstadoCajaInput, DataEstadoResult>(
        res, data, listaCajaServicios.estadoCaja,MAPA_HISTORIAL_ESTADO_CAJAS
    );

};


/**
 * Controlador de Express optimizado para gestionar exclusivamente el listado 
 * del historial de cajas cerradas y sus métricas asociadas.
 * Extrae y normaliza los parámetros de la petición (`req.query`), construye 
 * el objeto de entrada tipado y delega la ejecución al manejador centralizado de controladores.
 *
 * @async
 * @function estadoListaCaja
 * @param {Request} req - Objeto de petición HTTP de Express (contiene los filtros en `req.query` y la sesión en `req.usuario`).
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna valor, responde directamente a través de `handleControladores`.
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
    encabezadoHistorial : tryCatch( encabezadoHistorialCaja),
    estadoListaCaja : tryCatch(estadoListaCaja)
}   