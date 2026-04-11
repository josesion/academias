import { Request, Response } from 'express';

import { method as cuentaServicio } from "../Servicio/cuentas.escuelas";
//  Hooks seccion -----------------------
import { tryCatch } from '../utils/tryCatch';
import { enviarResponseError } from '../utils/responseError';
import { enviarResponse } from '../utils/response';

// Tipados seccion ----------------------
import { CodigoEstadoHTTP } from '../tipados/generico';

// Respuestas Seccion --------------------------
import { MAPA_CUENTAS_MODIFICACION, MAPA_CUENTAS_CREACCION,MAPA_CUENTAS_ESTADO, 
         ERROR_INTERNO_SERVIDOR, MAPA_CUENTAS_LISTADO,
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

/**
 * Controlador para actualizar el estado (ej. activo/inactivo) de una cuenta específica.
 * * * Obtiene el nuevo estado y los identificadores desde los parámetros de la URL,
 * procesa el cambio a través del servicio y responde siguiendo el contrato 
 * unificado de la API.
 *
 * @async
 * @param {Request} req - Objeto de petición de Express. 
 * - Params: estado (string), id_escuela (number), id_cuenta (number).
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía la respuesta mediante `enviarResponse` o `enviarResponseError`.
 * * @example
 * // Ejemplo de ruta: /cuentas/activar/1/5
 * // Donde 'activar' es el estado, '1' la escuela y '5' la cuenta.
 */
const estadoCuentasEscuela = async ( req : Request , res : Response) =>{
       
        const data = {
            estado : req.params.estado,
            id_escuela : Number(req.params.id_escuela),
            id_cuenta : Number(req.params.id_cuenta)
        };

        const resultEstadoCuenta = await cuentaServicio.estadoCuentasEscuelaServicio( data);
       
        const config = MAPA_CUENTAS_ESTADO[resultEstadoCuenta.code] || ERROR_INTERNO_SERVIDOR;

        if ( config.status ===  CodigoEstadoHTTP.OK){
            return enviarResponse(
                res,
                config.status,
                resultEstadoCuenta.message || config.msg,
                resultEstadoCuenta.data,
                undefined,
                resultEstadoCuenta.code
            );

        }else{
            return enviarResponseError(
                res,
                config.status,
                resultEstadoCuenta.message || config.msg,
                resultEstadoCuenta.code
            );
        };

};


/**
 * Controlador HTTP para el listado de cuentas.
 * * @async
 * @function listaCuentas
 * @param {Request} req - Objeto de petición Express. Se esperan query params: limit, pagina, id_escuela, estado, nombre_cuenta, tipo_cuenta.
 * @param {Response} res - Objeto de respuesta Express.
 * @returns {Promise<Response>} Respuesta JSON estandarizada mediante `enviarResponse` o `enviarResponseError`.
 * * @description
 * 1. Extrae y formatea los parámetros de búsqueda desde `req.query`.
 * 2. Delega la lógica de negocio y validación al servicio `listadoCuentasServicio`.
 * 3. Utiliza `MAPA_CUENTAS_LISTADO` para determinar el status HTTP y el mensaje base según el código de retorno.
 * 4. Envía la respuesta final al cliente incluyendo datos de paginación si la operación fue exitosa.
 */
const listaCuentas =  async ( req : Request, res : Response) =>{
    const data = {
        limite : Number(req.query.limit),
        pagina : Number(req.query.pagina),
        id_escuela : Number(req.query.id_escuela),
        estado : req.query.estado,
        nombre_cuenta : req.query.nombre_cuenta,
        tipo_cuenta  : req.query.tipo_cuenta,
    };
    
    const resultadoLista = await cuentaServicio.listadoCuentasServicio(data);
  
    const config = MAPA_CUENTAS_LISTADO[resultadoLista.code] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            resultadoLista.message || config.msg,
            resultadoLista.data,
            resultadoLista.paginacion,
            resultadoLista.code
        );
    }else{
        return enviarResponseError(
                res,
                config.status,
                resultadoLista.message || config.msg,
                resultadoLista.code
        );  
    };
};

export const method = {
    crearCuentaEscuela : tryCatch( crearCuentaEscuela ),
    modCuentaEscuela : tryCatch( modCuentaEscuela ),
    estadoCuentasEscuela : tryCatch( estadoCuentasEscuela),
    listaCuentas : tryCatch( listaCuentas)
};