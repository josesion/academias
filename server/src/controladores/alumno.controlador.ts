/**
 * @fileoverview Controlador Express para la Gestión CRUD (ABML) de la entidad Alumno.
 * @module controllers/alumno.controller
 * @description Contiene los manejadores de rutas para Alta, Baja, Modificación y Listado de alumnos.
 * Utiliza validación de esquemas (Zod) y wrappers de manejo de errores (`tryCatch`).
 */
import  { Response , Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { method as servicioAlumno } from "../Servicio/alumnos.servicios";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";


import { MAPA_ALTA_ALUMNO, MAPA_MOD_ALUMNO ,ERROR_INTERNO_SERVIDOR,
         MAPA_ESTADO_ALUMNO,   MAPA_LISTAR_ALUMNOS,  MAPA_LISTAR_SIN_PAGINACION_ALUMNOS
} from "../respuestas/alumnos";

import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * Controlador para procesar el alta de un nuevo alumno.
 * Extrae los datos del cuerpo de la petición y el ID de la escuela desde la sesión del usuario.
 * * @async
 * @function altaAlumno
 * @param {Request} req - Objeto de petición de Express. Contiene los datos del alumno en `req.body`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP con el resultado de la creación.
 */
const altaAlumno = async( req :  Request , res : Response) =>{

    const dataAlumno = {
        dni : req.body.dni,
        nombre : req.body.nombre,
        apellido : req.body.apellido,
        celular  : req.body.celular,
        id_escuela : req.usuario?.id_escuela
    };

    const altaAlumno = await servicioAlumno.altaAlumno(dataAlumno);

    const config = MAPA_ALTA_ALUMNO[altaAlumno.code] || ERROR_INTERNO_SERVIDOR; 

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            altaAlumno.message  || config.msg,
            altaAlumno.data,
            undefined,
            altaAlumno.code
        );
    }else{
        return enviarResponseError(
            res, 
            config.status,
            altaAlumno.message || config.msg,
            altaAlumno.code
        );
    };
  
};


/**
 * Controlador para modificar los datos de un alumno existente.
 * Toma el DNI desde los parámetros de la URL y los datos actualizados desde el cuerpo de la petición.
 * * @async
 * @function modAlumno
 * @param {Request} req - Objeto de petición de Express. Contiene `req.params.dni` y los campos a actualizar en `req.body`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP indicando el éxito o fallo de la modificación.
 */
const modAlumno = async( req : Request, res : Response) =>{
    
    const { dni } = req.params;
    const { nombre , apellido, celular } = req.body;

    // 1. Construcción del objeto de datos para la validación
    const datoAlumno = { 
        dni : dni ,
        nombre : nombre ,
        apellido : apellido ,
        celular  : String(celular),
        id_escuela : Number(req.usuario?.id_escuela)
    };

     const modAlumno = await servicioAlumno.modAlumno( datoAlumno);

     const config = MAPA_MOD_ALUMNO[modAlumno.code] || ERROR_INTERNO_SERVIDOR; 

     if (config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res, 
            config.status,
            modAlumno.message || config.msg,
            modAlumno.data,
            undefined,
            modAlumno.code
        );
     }else{
        return enviarResponseError(
            res, 
            config.status,
            modAlumno.message || config.msg,
            modAlumno.code
        );
     };

};


/**
 * Controlador para realizar una baja lógica o cambiar el estado de un alumno en la escuela.
 * Extrae el DNI y el nuevo estado desde la URL, asegurando la escuela mediante el token de sesión.
 * * @async
 * @function borrarAlumno
 * @param {Request} req - Objeto de petición de Express. Contiene `req.params.dni` y `req.params.estado`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP con el estado final del alumno.
 */
const borrarAlumno = async( req : Request , res : Response) =>{

    const { dni , estado  } = req.params;
    const id_escuela = Number(req.usuario?.id_escuela);

    const alumnoData = {
        dni : dni,
        id_escuela : id_escuela,
        estado : estado
    };

    const respuesta = await servicioAlumno.estadoAlumno(alumnoData);

    const config = MAPA_ESTADO_ALUMNO[ respuesta.code] || ERROR_INTERNO_SERVIDOR; 

    if ( config.status === CodigoEstadoHTTP.OK ){
        return enviarResponse(
            res, 
            config.status,
            respuesta.message || config.msg,
            respuesta.data,
            undefined,
            respuesta.code
        );
    }else{
        return enviarResponseError(
            res, 
            config.status,
            respuesta.message || config.msg,
            respuesta.code
        );
    };

};


/**
 * Controlador para obtener el listado de alumnos de forma paginada.
 * Lee los filtros de búsqueda, límite y página desde los Query Parameters de la URL.
 * * @async
 * @function listarAlumno
 * @param {Request} req - Objeto de petición de Express. Contiene los filtros y datos de paginación en `req.query`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP con la lista paginada y la metadata de paginación.
 */
const listarAlumno = async( req: Request  , res : Response) =>{
    const { estado , dni , apellido , limit , pagina } = req.query;

    const offset = ( Number(pagina) -1 ) * Number(limit) ;

    const dataListado = {
        estado , 
        dni , 
        apellido , 
        escuela : Number(req.usuario?.id_escuela) ,
        limit : Number(limit) , 
        offset : Number(offset),
        pagina : Number(pagina)
    };
    

   const resultadoListado = await servicioAlumno.listaAlumnos(dataListado);
   
   const config = MAPA_LISTAR_ALUMNOS[ resultadoListado.code ] || ERROR_INTERNO_SERVIDOR;

   if ( config.status === CodigoEstadoHTTP.OK  ){
        return enviarResponse(
            res, 
            config.status,
            resultadoListado.message || config.msg,
            resultadoListado.data,
            resultadoListado.paginacion,
            resultadoListado.code
        );
   }else{
        return enviarResponseError(
            res, 
            config.status,
            resultadoListado.message || config.msg,
            resultadoListado.code
        );
   };
   
};


/**
 * Controlador para obtener el listado completo de alumnos sin paginación.
 * Útil para selectores del frontend, filtrando por los Query Parameters provistos.
 * * @async
 * @function listaAlumnoSinPag
 * @param {Request} req - Objeto de petición de Express. Contiene filtros opcionales en `req.query`.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Respuesta HTTP con el listado completo de alumnos.
 */
const listaAlumnoSinPag = async ( req : Request , res : Response) =>{
    const { dni , estado} = req.query ;

    const data = {
        dni : String(dni) ,
        estado : String(estado) ,
        escuela : Number(req.usuario?.id_escuela)
    };

    const resultadoListado = await servicioAlumno.listadoSinPaginacion(data);

    const config = MAPA_LISTAR_SIN_PAGINACION_ALUMNOS[ resultadoListado.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK  ){
        return enviarResponse(
            res, 
            config.status,
            resultadoListado.message || config.msg, 
            resultadoListado.data,
            undefined,
            resultadoListado.code
        );
    }else{
        return enviarResponseError(
            res, 
            config.status,
            resultadoListado.message || config.msg,
            resultadoListado.code
        );
    };
};

export const  method ={
    altaAlumno   : tryCatch( altaAlumno ),
    modAlumno    : tryCatch( modAlumno ),
    borrarAlumno : tryCatch( borrarAlumno),
    listarAlumno : tryCatch( listarAlumno ),
    listaAlumnoSinPag : tryCatch( listaAlumnoSinPag )
}