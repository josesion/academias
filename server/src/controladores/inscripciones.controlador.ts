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
import { MAPA_INSCRIPCION, ERROR_INTERNO_SERVIDOR,  
         MAPA_LISTADO_INSCRIPCIONES, MAPA_ANULACION_INSCRIPCION } from "../respuestas/inscripciones";
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
    const id_escuela = req.usuario?.id_escuela;
    const id_usuario = req.usuario?.id;

    //  campos para la Inscripción
    const dataInscrip: InscripcionInputs = {
        id_plan: dataRecivida.id_plan,
        id_escuela: Number(id_escuela),
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
        id_escuela : Number(id_escuela),
        id_caja: dataRecivida.id_caja,
        id_categoria: dataRecivida.id_categoria,
        id_cuenta   : dataRecivida.id_cuenta,
        id_usuario  : Number(id_usuario),
        monto: dataRecivida.monto, // Usamos el mismo monto
        descripcion: dataRecivida.descripcion
    };



   const dataInscripcion = await inscripcionServicios.inscripcionServiciosCaja( dataInscrip, dataDetalle);

   const config = MAPA_INSCRIPCION[dataInscripcion.code]  || ERROR_INTERNO_SERVIDOR; 

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            dataInscripcion.message || config.msg,
            dataInscripcion.data,
            undefined,
            dataInscripcion.code
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            dataInscripcion.message || config.msg,
            dataInscripcion.code
        );
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
        
    const id_esccuela = req.usuario?.id_escuela;
  
    const dataListado = {
        limit : Number(req.query.limit),
        pagina : Number(req.query.pagina),
        id_escuela : Number(id_esccuela),
        fecha_desde : req.query.fecha_desde as string,
        fecha_hasta : req.query.fecha_hasta as string,
        estado  : req.query.estado as string,
        nombre_alumno : req.query.nombre_alumno,
        dni_alumno   : req.query.dni_alumno
    };
  
    const listadoResultado = await inscripcionServicios.listadoInscripciones(dataListado);

    const config =  MAPA_LISTADO_INSCRIPCIONES[listadoResultado.code]  || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res, 
            config.status,
            listadoResultado.message || config.msg,
            listadoResultado.data,
            listadoResultado.paginacion,
            listadoResultado.code
        );   
    }else{
        return enviarResponseError(
            res,
            config.status,
            listadoResultado.message || config.msg,
            listadoResultado.code
        );
    };

};


/**
 * Controlador HTTP para gestionar la solicitud de anulación de una inscripción.
 * * Se encarga de recibir la petición del cliente, estructurar los parámetros necesarios,
 * delegar la lógica de negocio pesada al servicio correspondiente y responder de forma
 * dinámica utilizando un mapa de configuración basado en los códigos de resultado.
 * * @async
 * @function anularInscripcion
 * @param {Request} req - Objeto de petición de Express. 
 * Expected `req.usuario` (inyectado por middleware de autenticación) y `req.body.id_inscripcion`.
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Respuesta HTTP formateada mediante `enviarResponse` o `enviarResponseError`.
 * * @description
 * El controlador ejecuta los siguientes pasos:
 * 1.  **Extracción de Contexto:** Obtiene los datos del usuario autenticado (`id_escuela`, `id_usuario`) desde el token.
 * 2.  **Estructuración de Payloads:** Separa y formatea los datos de la inscripción (`dataInsc`) y los datos iniciales de caja (`dataCaja`).
 * 3.  **Invocación del Servicio:** Delega la transacción a `inscripcionServicios.anularInscripcionServicio`.
 * 4.  **Mapeo Dinámico de Respuestas:** Utiliza el diccionario `MAPA_ANULACION_INSCRIPCION` pasándole el `anularResultado.code`. 
 * Si el código no está registrado, aplica por defecto un cortocircuito a `ERROR_INTERNO_SERVIDOR`.
 * 5.  **Despacho:** Determina si el estado es de éxito (`200 OK`) o un fallo (cualquier otro código) para enviar la respuesta limpia al frontend.
 */
const anularInscripcion = async ( req : Request, res : Response) => {

    const id_escuela = req.usuario?.id_escuela;
    const id_usuario = req.usuario?.id;
   
    const dataInsc = {
        id_escuela : Number(id_escuela),
        id_inscripcion : Number( req.body.id_inscripcion ),
        estadoInsc  : "activos",// queda fijo para q siempre busque el activos
        id_usuario : id_usuario,
        id_cuenta  : req.body.id_cuenta || null,
    };
    const dataDetalle = {
        descripcion : "Anulación de inscripción"// queda fijo para q siempre muestre este comentario
    };

    const anularResultado = await inscripcionServicios.anularInscripcionServicio( dataInsc, dataDetalle );
  
    const config = MAPA_ANULACION_INSCRIPCION[ anularResultado.code ]  || ERROR_INTERNO_SERVIDOR; 

    if (config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            anularResultado.message || config.msg,
            anularResultado.data,
            undefined,
            anularResultado.code     
        );
    }else{
        return enviarResponseError(
            res,
            config.status,
            anularResultado.message || config.msg,   
            anularResultado.code      
        );
    };
};


export const method = {
    inscripcion    : tryCatch( inscripcion ),
    listadoInscripciones : tryCatch( listadoInscripciones ),
    anularInscripcion   : tryCatch( anularInscripcion ),
};
