import { Response , Request } from "express";
// hooks
import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

//Servicios Data
import { method as horarioServicio} from "../Servicio/horarios.servicios"

// Typados
import { CodigoEstadoHTTP } from "../tipados/generico"; 





/**
 * altaHorario
 * -----------
 * Controlador encargado de manejar el alta de un horario de clase.
 *
 * Recibe los datos desde el body del request, delega la lógica de negocio
 * al servicio de horarios y traduce el resultado a una respuesta HTTP adecuada.
 *
 * Responsabilidades:
 *  - No contiene reglas de negocio
 *  - Interpreta los códigos devueltos por el service
 *  - Devuelve el status HTTP correspondiente según el resultado
 *
 * Códigos manejados:
 *  - HORARIO_OCUPADO → 409 CONFLICT
 *  - PROFESOR_OCUPADO → 409 CONFLICT
 *  - HORARIO_CREADO_EXITOSAMENTE → 201 CREATED
 *  - Cualquier otro → 500 INTERNAL SERVER ERROR
 *
 * @async
 *
 * @param {Request} req
 * Request de Express. Se espera que el body contenga
 * los datos necesarios para crear un horario de clase.
 *
 * @param {Response} res
 * Response de Express utilizada para devolver la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Retorna la respuesta HTTP correspondiente al resultado
 * de la operación de alta del horario.
 */

const altaHorario = async( req : Request , res : Response) =>{
    const dataRecivida = req.body;

    const dataHorario  = await horarioServicio.alta( dataRecivida );
    
    switch (dataHorario.code) {
        case "HORARIO_OCUPADO":
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                dataHorario.message,
                dataHorario.code
            );

        case "PROFESOR_OCUPADO":
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.CONFLICTO,
                dataHorario.message,
                dataHorario.code
            );

        case "HORARIO_CREADO_EXITOSAMENTE":
            return enviarResponse(
                res,
                CodigoEstadoHTTP.CREADO,
                dataHorario.message,
                dataHorario.data,
                undefined,
                dataHorario.code
            );

        default:
            return enviarResponseError(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                "Ocurrió un error inesperado en el alta del horario",
                dataHorario.code
            );
    }

}; 


/**
 * listadoHorarioEscuela
 * ---------------------
 * Controlador encargado de obtener el calendario de horarios de una escuela.
 *
 * Construye el objeto de entrada a partir de los parámetros de query,
 * delega la lógica al servicio de horarios y traduce el resultado
 * a una respuesta HTTP.
 *
 * Responsabilidades:
 *  - Adaptar los parámetros del request (query) al formato esperado por el service
 *  - Interpretar los códigos de negocio devueltos
 *  - Enviar la respuesta HTTP correspondiente
 *
 * Query params esperados:
 *  - id_escuela {number} (obligatorio)
 *  - estado {string} (opcional)
 *
 * Códigos manejados:
 *  - CALENDARIO_VACIO → 404 NOT FOUND
 *  - CALENDARIO_ESCUELA_LISTADO → 200 OK
 *
 * @async
 *
 * @param {Request} req
 * Request de Express. Se utilizan los parámetros de query
 * para obtener el calendario de la escuela.
 *
 * @param {Response} res
 * Response de Express utilizada para devolver la respuesta HTTP.
 *
 * @returns {Promise<Response>}
 * Retorna la respuesta HTTP con el calendario de horarios
 * o un error si no existen clases asignadas.
 */

const listadoHorarioEscuela = async( req : Request , res : Response ) =>{
   
    const data = {
        id_escuela: Number(req.query.id_escuela),
        estado: req.query.estado as string | undefined
    };

    const resultadoCalendario = await horarioServicio.calendario( data );
    if ( resultadoCalendario.code === "CALENDARIO_VACIO"){
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.NO_ENCONTRADO,
            resultadoCalendario.message,
            resultadoCalendario.code
        )    
    };

    return enviarResponse(
        res,
        CodigoEstadoHTTP.OK,
        resultadoCalendario.message,
        resultadoCalendario.data,
        undefined,
        resultadoCalendario.code
    );
  
};


/**
 * Controlador para modificar un horario de clase.
 *
 * Recibe los datos desde el cuerpo de la petición HTTP,
 * los normaliza al tipo correspondiente y delega la
 * modificación del horario al servicio de horarios.
 * Retorna una respuesta HTTP estándar según el resultado.
 *
 * @async
 * @function modHorario
 *
 * @param {Request} req
 * Objeto Request de Express que contiene los datos del horario
 * a modificar en el cuerpo de la petición.
 *
 * @param {Response} res
 * Objeto Response de Express utilizado para enviar la respuesta
 * al cliente.
 *
 * @returns {Promise<Response | void>}
 * Retorna una respuesta HTTP con estado OK cuando la modificación
 * es exitosa, o un error interno del servidor en caso contrario.
 *
 * @example
 * ```ts
 * // PUT /horarios/modificar
 * app.put('/horarios/modificar', modHorario);
 * ```
 */

const modHorario = async( req : Request, res : Response) => {
  
    const data = {
        id : Number(req.body.id),
        id_escuela: Number(req.body.id_escuela),
        id_nivel : Number(req.body.id_nivel),
        id_tipo_clase :  Number(req.body.id_tipo_clase),
        dni_profesor  : req.body.dni_profesor as string
    };

    const resultado = await horarioServicio.mod(data);
 
    if (resultado.code === "HORARIO_MODIFICADO_EXITOSAMENTE"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            resultado.message,
            resultado.data,
            undefined,
            resultado.code
        );
    };


    return enviarResponseError(
        res,
        CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        resultado.message,
        resultado.code
    );
    
};

/**
 * Controlador para eliminar lógicamente un horario de clase.
 *
 * Recibe los datos desde el cuerpo de la petición HTTP,
 * construye el objeto de eliminación respetando el contrato
 * de negocio (estado como string) y delega la operación
 * al servicio de horarios.
 *
 * @async
 * @function elimnarHorario
 *
 * @param {Request} req
 * Objeto Request de Express que contiene en el body los datos
 * necesarios para la eliminación lógica del horario.
 *
 * @param {Response} res
 * Objeto Response de Express utilizado para enviar la respuesta
 * al cliente.
 *
 * @returns {Promise<Response | void>}
 * Retorna una respuesta HTTP OK cuando la eliminación es exitosa
 * o un error interno del servidor en caso de falla.
 *
 * @remarks
 * El campo `estado` se maneja como string según el contrato
 * de negocio (por ejemplo: `"ACTIVO"`, `"INACTIVO"`, `"ELIMINADO"`).
 *
 * @example
 * ```ts
 * // DELETE /horarios/eliminar
 * app.delete('/horarios/eliminar', elimnarHorario);
 * ```
 */

const elimnarHorario = async ( req : Request , res: Response) => {
    
    const  data = {
        id_escuela : Number(req.body.id_escuela),
        id         : Number(req.body.id),
        estado     : req.body.estado as string,
        vigente    : req.body.vigente as boolean
    };

    const resultadoEliminar = await horarioServicio.eliminar(data);

    if (resultadoEliminar.code === "HORARIO_ELIMINADO"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            resultadoEliminar.message,
            resultadoEliminar.data,
            undefined,
            resultadoEliminar.code
        );
    };

    return enviarResponseError(
        res,
        CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
        resultadoEliminar.message,
        resultadoEliminar.code
    );   

};


export const method = {
    alta  : tryCatch( altaHorario),
    mod   : tryCatch(modHorario),
    eliminar : tryCatch(elimnarHorario),
    listadoHorarioEscuela : tryCatch(listadoHorarioEscuela )
};