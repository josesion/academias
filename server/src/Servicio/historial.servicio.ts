import { tryCatchDatos } from "../utils/tryCatchBD";
import { method  as dataHistorial} from "../data/historial.data";

import type{ ResultHistorial, ResultPostHistorial } from "../data/historial.data";
import { TipadoData } from "../tipados/tipado.data";

import { HistorialInputs, historialSchema , 
         GetHistorialInputs ,GetHistorialSchema 
       } from "../squemas/historial";

/**
 * Servicio encargado de validar y persistir una nueva entrada en el historial.
 * 
 * Esta función intermedia realiza dos pasos críticos:
 * 1. Valida los datos recibidos utilizando el esquema de Zod (`historialSchema`).
 * 2. Invoca la capa de persistencia (`dataHistorial.postHistorial`) y traduce 
 *    los códigos de respuesta del backend a respuestas de servicio estandarizadas.
 *
 * @async
 * @function postHistorialServicio
 * @param {HistorialInputs} data - Los datos de la acción a registrar.
 * 
 * @returns {Promise<TipadoData<ResultPostHistorial>>} Promesa que resuelve con un objeto de respuesta 
 * estandarizado (`error`, `message`, `data`, `code`).
 * 
 * @throws {ZodError} Si la validación de `data` falla según `historialSchema`.
 * 
 * @example
 * try {
 *    const response = await postHistorialServicio(miData);
 *    if (!response.error) {
 *       console.log("Historial guardado:", response.message);
 *    }
 * } catch (error) {
 *    console.error("Error de validación:", error);
 * }
 */
const postHistorialServicio = async( data : HistorialInputs)
:Promise<TipadoData<ResultPostHistorial>> =>{

    const verificarHostirial : HistorialInputs = historialSchema.parse( data) ;
    const resultPost = await dataHistorial.postHistorial( verificarHostirial );

    if ( resultPost.code === 'HISTORIAL_POST_CREAR' ){
        return {
            error : false,
            message : "Se guardo correctamente el historial.",
            data : resultPost.data,
            code : "HISTORIAL_OK"
        };
    };

    return {
        error : true, 
        message : "Error en el serivdor, historial.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio encargado de obtener y validar el historial de actividades de una escuela.
 * 
 * Este servicio realiza los siguientes pasos:
 * 1. Valida los parámetros de entrada mediante `GetHistorialSchema`.
 * 2. Solicita el historial a la capa de datos (`dataHistorial.getHistorial`).
 * 3. Mapea los códigos de respuesta del backend a respuestas de servicio amigables para el frontend.
 *
 * @async
 * @function getHistorialServicio
 * @param {GetHistorialInputs} data - Objeto que contiene el ID de la escuela requerido para la consulta.
 * 
 * @returns {Promise<TipadoData<ResultHistorial[]>>} Promesa que resuelve con la lista de actividades si es exitoso, 
 * o un objeto de error si el historial está vacío o hubo problemas en el servidor.
 * 
 * @throws {ZodError} Si el ID de la escuela no cumple con el formato requerido por `GetHistorialSchema`.
 * 
 * @example
 * const res = await getHistorialServicio({ id_escuela: 1 });
 * if (!res.error) {
 *    renderHistorial(res.data);
 * } else {
 *    console.warn(res.message);
 * }
 */
const getHistorialServicio =async ( data : GetHistorialInputs)
:Promise<TipadoData<ResultHistorial[]>> =>{

    const dataValidada : GetHistorialInputs = GetHistorialSchema.parse( data );

    const listaActividad = await dataHistorial.getHistorial(dataValidada);
   
    if ( listaActividad.code === 'HISTORIAL_LISTADO_NO_LISTED' ){
        return{
            error : true,
            message : "Sin listado de actividad.",
            code : "SIN_HISTORIAL"
        };
    };

    if ( listaActividad.code === 'HISTORIAL_LISTADO_LISTED' ){
        return{
            error : false,
            message : "Listado de actividades.",
            data : listaActividad.data,
            code : "LISTADO_ACTIVIDADES_OK"
        };    
    };


    return {
        error : true, 
        message : "Error en el servidor, listado historial.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
    postHistorialServicio : tryCatchDatos( postHistorialServicio ),
    getHistorialServicio  : tryCatchDatos( getHistorialServicio ),
};