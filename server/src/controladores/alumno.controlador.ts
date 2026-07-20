/**
 * @fileoverview Controlador Express para la Gestión CRUD (ABML) de la entidad Alumno.
 * @module controllers/alumno.controller
 * @description Contiene los manejadores de rutas para Alta, Baja, Modificación y Listado de alumnos.
 * Utiliza validación de esquemas (Zod) y wrappers de manejo de errores (`tryCatch`).
 */
import  { Response , Request } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";
import { method as servicioAlumno } from "../Servicio/alumnos.servicios";


import {  AlumnosInputs, EliminarAlumnoInputs ,ListaAlumnoInputs,  ListaAlumnoSinPaginacionInputs } from "../squemas/alumno";
import type { RetornoRegistroAlumno , RetornoModAlumno, DataAlumnosListado ,DataAlumnosListadoSinPag} from "../tipados/alumno.data";

import { MAPA_ALTA_ALUMNO, MAPA_MOD_ALUMNO , MAPA_LISTAR_SIN_PAGINACION_ALUMNOS,
         MAPA_ESTADO_ALUMNO,   MAPA_LISTAR_ALUMNOS,  
} from "../respuestas/alumnos";



/**
 * Controlador encargado de procesar la solicitud para registrar un nuevo alumno en el sistema,
 * extrayendo los datos desde el cuerpo de la petición (`req.body`) y combinándolos 
 * con la información de contexto del usuario y la escuela autenticados.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los campos obligatorios del alumno (`dni`, `nombre`, `apellido`, `celular`) directamente desde `req.body`.
 * 2. Asocia automáticamente el `id_escuela` y el `id_usuario` a partir de la sesión o token del usuario autenticado (`req.usuario`), asegurando su conversión a número.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto `dataAlumno`, el servicio correspondiente (`servicioAlumno.altaAlumno`) y el mapa de códigos de la operación.
 *
 * @async
 * @function altaAlumno
 * @param {Request} req - Objeto de petición de Express, que contiene los datos del nuevo alumno en el `body` 
 * y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado del alta.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante el flujo de `handleControladores`.
 * 
 * @example
 * // Petición HTTP POST esperada:
 * // /api/alumnos
 * // Body: { "dni": "35123456", "nombre": "Maria", "apellido": "Gomez", "celular": "3874998877" }
 */
const altaAlumno = async( req :  Request , res : Response) =>{

    const dataAlumno = {
        dni : req.body.dni,
        nombre : req.body.nombre,
        apellido : req.body.apellido,
        celular  : req.body.celular,
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id),
    };

    await handleControladores<AlumnosInputs,RetornoRegistroAlumno >(
        res, dataAlumno, servicioAlumno.altaAlumno, MAPA_ALTA_ALUMNO
    );
  
};


/**
 * Controlador encargado de procesar la solicitud para modificar los datos de un alumno,
 * combinando los parámetros de la ruta (`dni`) con el cuerpo de la petición (`req.body`)
 * y delegando la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el `dni` de los parámetros de la ruta (`req.params`) y los campos editables (`nombre`, `apellido`, `celular`) del cuerpo de la petición.
 * 2. Construye el objeto `datoAlumno`, asegurando el casting de los campos numéricos requeridos 
 *    (ID de escuela y de usuario) y convirtiendo el celular a string.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioAlumno.modAlumno`) y el mapa de códigos de la operación.
 *
 * @async
 * @function modAlumno
 * @param {Request} req - Objeto de petición de Express, que contiene el `dni` en los parámetros de ruta, 
 * los nuevos datos en el `body`, y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la modificación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP a través de `handleControladores`.
 * 
 * @example
 * // Petición HTTP PUT esperada:
 * // /api/alumnos/12345678
 * // Body: { "nombre": "Carlos", "apellido": "Gomez", "celular": "3874123456" }
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
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<AlumnosInputs, RetornoModAlumno>(
        res, datoAlumno, servicioAlumno.modAlumno, MAPA_MOD_ALUMNO
    );
};


/**
 * Controlador encargado de procesar la solicitud para cambiar el estado (eliminar/desactivar o activar) 
 * de un alumno, extrayendo los parámetros de la ruta (route params) y delegando la ejecución.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `dni` y `estado` directamente desde los parámetros de la URL (`req.params`).
 * 2. Construye el objeto `alumnoData` tipado como `EliminarAlumnoInputs`, casteando los tipos necesarios 
 *    como el ID de escuela, ID de usuario y asegurando el tipado estricto del estado.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioAlumno.estadoAlumno`) y el mapa de códigos de la operación.
 *
 * @async
 * @function borrarAlumno
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de ruta (`dni`, `estado`) 
 * y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la operación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP DELETE o PATCH esperada:
 * // /api/alumnos/12345678/inactivos
 */
const borrarAlumno = async( req : Request , res : Response) =>{

    const { dni , estado  } = req.params;
     

    const alumnoData : EliminarAlumnoInputs = {
        dni : dni,
        id_escuela :  Number(req.usuario?.id_escuela),
        estado : estado as "activos" | "inactivos",
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<EliminarAlumnoInputs,{dni : string} >(
        res, alumnoData, servicioAlumno.estadoAlumno , MAPA_ESTADO_ALUMNO 
    );
};


/**
 * Controlador encargado de procesar la solicitud para obtener el listado paginado de alumnos,
 * calculando los parámetros de paginación (offset) y delegando la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de la consulta (`limit`, `pagina`, `estado`, `dni`, `apellido`) desde `req.query`.
 * 2. Realiza el casting y sanitización de los valores (strings para filtros y números para paginación/usuario/escuela).
 * 3. Calcula matemáticamente el `offset` basado en la página actual y el límite por página.
 * 4. Construye el objeto `dataListado` tipado como `ListaAlumnoInputs`.
 * 5. Ejecuta `handleControladores` pasando la respuesta (`res`), los datos, el servicio correspondiente 
 *    (`servicioAlumno.listaAlumnos`) y el mapa de códigos de error/éxito.
 *
 * @async
 * @function listarAlumno
 * @param {Request} req - Objeto de petición de Express, que contiene los query params de filtrado/paginación 
 * y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar los datos devueltos por el manejador.
 * 
 * @returns {Promise<void>} No retorna valor directo; gestiona la respuesta HTTP a través de `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/alumnos?pagina=1&limit=10&estado=activo&dni=&apellido=Perez
 */
const listarAlumno = async( req: Request  , res : Response) =>{
    const {  limit , pagina  } = req.query;
    const estado = String(req.query.estado ?? "");
    const dni = String(req.query.dni ?? "");
    const apellido = String(req.query.apellido ?? "");
    const offset = ( Number(pagina) -1 ) * Number(limit) ;

    const dataListado : ListaAlumnoInputs = {
        estado , 
        dni , 
        apellido , 
        escuela : Number(req.usuario?.id_escuela) ,
        id_usuario : Number(req.usuario?.id),
        limit : Number(limit) , 
        offset : Number(offset),
        pagina : Number(pagina)
    };

    await handleControladores<ListaAlumnoInputs, DataAlumnosListado[]>(
        res, dataListado, servicioAlumno.listaAlumnos , MAPA_LISTAR_ALUMNOS
    );
};


/**
 * Controlador encargado de procesar la solicitud para obtener el listado de alumnos 
 * sin paginación, extrayendo los parámetros de la consulta (query params) 
 * y delegando la ejecución al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `dni` y `estado` de los query parameters de la petición (`req.query`).
 * 2. Construye el objeto `data` tipado como `ListaAlumnoSinPaginacionInputs`, 
 *    asegurando las conversiones correctas de tipo (strings y números para escuela/usuario).
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), los datos procesados, 
 *    el servicio correspondiente (`servicioAlumno.listadoSinPaginacion`) y el mapa de códigos.
 *
 * @async
 * @function listaAlumnoSinPag
 * @param {Request} req - Objeto de petición de Express, que incluye los query parameters (`dni`, `estado`) 
 * y los datos del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado al cliente.
 * 
 * @returns {Promise<void>} No retorna un valor directo; responde a través del objeto `res` 
 * mediante el flujo de `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/alumnos/sin-paginacion?dni=12345678&estado=activo
 */
const listaAlumnoSinPag = async ( req : Request , res : Response) =>{
    const { dni , estado} = req.query ;

    const data : ListaAlumnoSinPaginacionInputs = {
        dni : String(dni) ,
        estado : String(estado) ,
        escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores< ListaAlumnoSinPaginacionInputs,DataAlumnosListadoSinPag[] >(
        res, data, servicioAlumno.listadoSinPaginacion, MAPA_LISTAR_SIN_PAGINACION_ALUMNOS
    );

};

export const  method ={
    altaAlumno   : tryCatch( altaAlumno ),
    modAlumno    : tryCatch( modAlumno ),
    borrarAlumno : tryCatch( borrarAlumno),
    listarAlumno : tryCatch( listarAlumno ),
    listaAlumnoSinPag : tryCatch( listaAlumnoSinPag )
}