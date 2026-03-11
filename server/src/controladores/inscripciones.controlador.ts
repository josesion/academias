import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionServicios } from "../Servicio/inscripciones.servicios";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";
import { DetalleCajaInputs } from "../squemas/cajas";
import { InscripcionInputs } from "../squemas/inscripciones";

/**
 * Controlador para gestionar la inscripción de un alumno.
 * 
 * Valida la inscripción recibida desde el cliente, llama al servicio
 * correspondiente para verificar si ya existe, crearla o retornar un error
 * de negocio, y luego envía la respuesta HTTP adecuada al cliente.
 * 
 * @param {Request} req - Objeto de solicitud Express. Se espera que en `req.body` 
 *                        venga la información de la inscripción.
 * @param {Response} res - Objeto de respuesta Express para enviar el resultado.
 * 
 * @returns {Promise<Response>} - Retorna una respuesta HTTP usando `enviarResponse` 
 *                                o `enviarResponseError`, dependiendo del resultado
 *                                de la operación de inscripción.
 * 
 * @example
 * // Ejemplo de uso en rutas Express
 * router.post('/inscripcion', inscripcion);
 */

const inscripcion = async( req : Request , res : Response ) =>{
    const dataRecivida = req.body;

    //  campos para la Inscripción
    const dataInscrip: InscripcionInputs = {
        id_plan: dataRecivida.id_plan,
        id_escuela: dataRecivida.id_escuela,
        dni_alumno: dataRecivida.dni_alumno,
        fecha_inicio: dataRecivida.fecha_inicio,
        fecha_fin: dataRecivida.fecha_fin,
        monto: dataRecivida.monto,
        clases_asignadas_inscritas: dataRecivida.clases_asignadas_inscritas,
        meses_asignados_inscritos: dataRecivida.meses_asignados_inscritos,
        estado :"activos"
    };

    // campos para el Detalle de Caja
    const dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'> = {
        id_caja: dataRecivida.id_caja,
        id_categoria: dataRecivida.id_categoria,
        monto: dataRecivida.monto, // Usamos el mismo monto
        metodo_pago: dataRecivida.metodo_pago,
        descripcion: dataRecivida.descripcion
    };

 const dataInscripcion = await inscripcionServicios.inscripcionServiciosCaja( dataInscrip, dataDetalle);
switch(dataInscripcion.code){
    // Casos en el cual devueve un error de negocio
    case "INSCRIPCION_EXISTENTE" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                dataInscripcion.message,
                dataInscripcion.code
            );
        };

    case "INSCRIPCION_CREACION_FALLIDA" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
                "Ocurrió un error inesperado en el alta del horario",
                dataInscripcion.code
            );
    };

    case "NO_SE_LOGRO_VERIFICAR" : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ENTIDAD_NO_PROCESABLE,
                "Ocurrió un error inesperado al verificar el horario",
                dataInscripcion.code
            );        
    };

    // Casos en lo que va todo bien
 
    case "INSCRIPCION_EXITOSA" : {
        return enviarResponse(
            res, 
            CodigoEstadoHTTP.OK,
            dataInscripcion.message,
            dataInscripcion.data,
            undefined,
            dataInscripcion.code
        );
    };
    
    default : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Ocurrió un error inesperado en la inscripcion",
                dataInscripcion.code
            );
    }
};
    
};


/**
 * Controlador de Express para manejar la petición HTTP del listado de inscripciones.
 * Extrae los parámetros de la URL (query strings), invoca el servicio de inscripciones
 * y devuelve una respuesta estandarizada al cliente.
 * * @async
 * @function listadoInscripciones
 * @param {Request} req - Objeto de petición de Express. 
 * Se esperan en req.query: limit, pagina, id_escuela, fecha_desde, fecha_hasta, estado.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>} Envía una respuesta HTTP usando enviarResponse o enviarResponseError.
 */
const listadoInscripciones = async ( req : Request, res : Response ) => {
  
    const dataListado = {
        limit : Number(req.query.limit),
        pagina : Number(req.query.pagina),
        id_escuela : Number(req.query.id_escuela),
        fecha_desde : req.query.fecha_desde as string,
        fecha_hasta : req.query.fecha_hasta as string,
        estado  : req.query.estado as string
    };
     // console.log( dataListado)
    const listadoResultado = await inscripcionServicios.listadoInscripciones(dataListado);

    switch ( listadoResultado.code){
        case "LISTADO_INSCRIPCION_OK" : {
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                listadoResultado.message,
                listadoResultado.data,
                listadoResultado.paginacion,
                listadoResultado.code
            );
        };

        case "LISTADO_VACIO" : {
           return enviarResponseError(
                res,
                CodigoEstadoHTTP.NO_ENCONTRADO,
                listadoResultado.message,
                listadoResultado.code
           ); 
        };

        default : {
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Error , Listado Inscripciones",
                listadoResultado.code
            );
        };    
    };
};

export const method = {
    inscripcion    : tryCatch( inscripcion ),
    listadoInscripciones : tryCatch( listadoInscripciones ),
}
