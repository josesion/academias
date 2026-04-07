import { Request, Response } from 'express';

import { method as cuentaServicio } from "../Servicio/cuentas.escuelas";
//  Hooks seccion -----------------------
import { tryCatch } from '../utils/tryCatch';
import { enviarResponseError } from '../utils/responseError';
import { enviarResponse } from '../utils/response';

// Tipados seccion ----------------------
import { CodigoEstadoHTTP } from '../tipados/generico';

// Respuestas Seccion --------------------------
import { MAPA_CUENTAS_MODIFICACION, MAPA_CUENTAS_CREACCION, 
        ERROR_INTERNO_SERVIDOR, 
} from '../respuestas/cuentas.escuelas';

/**
 * Controlador para la creación de una nueva cuenta asociada a una escuela.
 * * Extrae los datos del cuerpo de la petición, delega la creación al servicio de cuentas
 * y normaliza la respuesta utilizando el mapa de configuraciones de creación.
 *
 * @async
 * @param {Request} req - Objeto de petición de Express. Se espera en el body: id_escuela, nombre_cuenta y tipo_cuenta.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta estandarizada mediante `enviarResponse` o `enviarResponseError`.
 * * @example
 * // La respuesta exitosa incluirá el código definido en el mapa (ej. "CUENTA_CREADA")
 * // La respuesta fallida usará el estado HTTP correspondiente (ej. 409 para duplicados).
 */
const crearCuentaEscuela = async ( req : Request, res : Response) => {

    const dataCuenta = {
        id_escuela : req.body.id_escuela,
        nombre_cuenta : req.body.nombre_cuenta,
        tipo_cuenta : req.body.tipo_cuenta,
        estado : "activos"
    };  
    
    const respuestaServicio = await cuentaServicio.crearCuentaServicios( dataCuenta);

    const config = MAPA_CUENTAS_CREACCION[respuestaServicio.code] || ERROR_INTERNO_SERVIDOR;

    if (config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            respuestaServicio.message || config.msg,
            respuestaServicio.data,
            undefined,
            respuestaServicio.code
        );

    }else{
        return enviarResponseError(
            res, 
            config.status,
            respuestaServicio.message || config.msg,
            respuestaServicio.code
        );
    };

};

  
/**
 * Controlador para la modificación de una cuenta existente de una escuela.
 * * Extrae los identificadores de los parámetros de la ruta y los nuevos datos del cuerpo 
 * de la petición, delega la actualización al servicio y retorna una respuesta 
 * estandarizada basada en el mapa de modificaciones.
 *
 * @async
 * @param {Request} req - Objeto de petición de Express. 
 * - Params: id_cuenta, id_escuela.
 * - Body: nuevo_nombre_cuenta, nuevo_tipo_cuenta.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía la respuesta al cliente mediante `enviarResponse` o `enviarResponseError`.
 * * @example
 * // Si el código devuelto por el servicio es "CUENTAS_EXISTE", 
 * // el controlador responderá con un estado 409 y el mensaje del mapa.
 */
const modCuentaEscuela = async ( req : Request, res : Response) => {

    const dataMod = {
        id_cuenta : Number(req.params.id_cuenta),
        id_escuela : Number(req.params.id_escuela),
        nuevo_nombre_cuenta : req.body.nuevo_nombre_cuenta,
        nuevo_tipo_cuenta : req.body.nuevo_tipo_cuenta,
    };

    const respuestaServicioModifcacion = await cuentaServicio.modCuentaEscuelaServicio( dataMod);


    const config = MAPA_CUENTAS_MODIFICACION[respuestaServicioModifcacion.code] || ERROR_INTERNO_SERVIDOR;

    if (config.status === CodigoEstadoHTTP.OK) {
            return enviarResponse(
                    res, 
                    config.status, 
                    respuestaServicioModifcacion.message ||  config.msg, 
                    respuestaServicioModifcacion.data, 
                    undefined, 
                    respuestaServicioModifcacion.code);
    }; 

    return enviarResponseError(
        res, 
        config.status,
        respuestaServicioModifcacion.message ||  config.msg, 
        respuestaServicioModifcacion.code 
    );   
      
};


export const method = {
    crearCuentaEscuela : tryCatch( crearCuentaEscuela ),
    modCuentaEscuela : tryCatch( modCuentaEscuela ),
};