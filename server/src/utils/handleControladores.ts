import {  Response } from "express";
import { TipadoData } from "../tipados/tipado.data";
import { CodigoEstadoHTTP } from "../tipados/generico";
import { enviarResponse } from "./response";
import { enviarResponseError } from "./responseError";

 const ERROR_INTERNO_SERVIDOR = {
    status : CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg : "Error en el servidor, por favor intente nuevamente"
} as const;   

/**
 * Handler genérico para controladores de API que centraliza la ejecución de servicios,
 * el manejo de respuestas HTTP y la gestión de errores.
 * * @template T - El tipo de dato que espera recibir el servicio (input).
 * @template R - El tipo de dato que contiene la propiedad `data` en la respuesta del servicio.
 * * @param {Response} res - Objeto de respuesta de Express.
 * @param {T} parametros - Datos necesarios para ejecutar el servicio.
 * @param {(data: T) => Promise<TipadoData<R>>} servicio - Función de servicio que procesa la lógica de negocio.
 * @param {Record<string, any>} map - Mapa que relaciona los códigos de respuesta del servicio con configuraciones HTTP.
 * * @returns {Promise<void>} Envía la respuesta al cliente utilizando `enviarResponse` o `enviarResponseError`.
 */

export const handleControladores = async<T, R> (
    res: Response,
    parametros : T , 
    servicio: (data: any) => Promise<TipadoData<R>>,
    map: Record<string, any>, 
) => {
   
    const result = await servicio(parametros);
    const config = map[result.code] ||  ERROR_INTERNO_SERVIDOR;

    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, 
                              result.paginacion ? result.paginacion : undefined , result.code);
    } else {
        return enviarResponseError(res, config.status, result.message || config.msg, result.code);
    }
};