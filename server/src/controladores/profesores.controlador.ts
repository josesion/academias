import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { fechaHoy } from "../hooks/fecha";

import { handleControladores } from "../utils/handleControladores";

import { method as servicioProfesor } from "../Servicio/profesores.servicio";

// Typados

import {
     MAPA_ALTA_PROFESORES , MAPA_MOD_PROFESORES,
     MAPA_ESTADO_PROFESORES, MAPA_LISTADO_PROFESORES, MAPA_LISTADO_SIN_PAG_PROFESORES
 } from "../respuestas/profesores";

import { 
         ProfesorInputs , ModProfesorInputs , EstadoProfesorInputs,
         ListadoProfeInputs , ListadoProfeSinPagInputs
} from "../squemas/profesores"; 

import { 
         ProfesoresGlobales , FiltroProfeEscuelaBaja, 
         ResulListadoProfesoresUsuarios, ListadoProfeResults 
} from "../tipados/profesores.data";



/**
 * Controlador encargado de gestionar la petición HTTP para dar de alta a un nuevo profesor en la escuela.
 * Extrae los datos personales del cuerpo de la petición (`body`), completa los metadatos necesarios (como la fecha de creación,
 * estado inicial y credenciales de usuario/escuela de la sesión), construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `dni`, `nombre`, `apellido` y `celular` del cuerpo de la solicitud HTTP.
 * 2. Construye el objeto de tipo `ProfesorInputs` asignando valores por defecto como la fecha actual (`fechaHoy()`), `fecha_baja` como nula, el estado "activos", y extrayendo el ID de escuela e ID de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `servicioProfesor.altaProfesor` y el mapa de códigos de error/éxito (`MAPA_ALTA_PROFESORES`).
 *
 * @async
 * @function altaProfesores
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición POST esperada:
 * // /profesores
 * // Body: { "dni": "35123456", "nombre": "Juan", "apellido": "Pérez", "celular": "3874123456" }
 */
const altaProfesores = async( req : Request , res : Response ) => {
    const { dni , nombre , apellido , celular} = req.body ;

    const dataEntrada : ProfesorInputs = {
            dni       : dni ,
            nombre    : nombre,
            apellido  : apellido,
            celular   : celular,

            fecha_creacion : fechaHoy(), 
            fecha_baja : null,
            id_escuela : ( req.usuario?.id_escuela) || 0,
            id_usuario : ( req.usuario?.id) || 0,
            estado : "activos"
    };

    await handleControladores<ProfesorInputs,{ dni : string} >(
        res, dataEntrada, servicioProfesor.altaProfesor, MAPA_ALTA_PROFESORES
    );

};


/**
 * Controlador encargado de gestionar la petición HTTP para modificar los datos de un profesor existente.
 * Extrae el DNI de los parámetros de la ruta, los datos actualizados del cuerpo de la petición (`body`),
 * y la información del usuario autenticado, construyendo el objeto de entrada tipado para delegar la ejecución
 * al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el `dni` de los parámetros de la ruta (`params`) y `nombre`, `apellido` y `celular` del cuerpo de la solicitud (`body`).
 * 2. Construye el objeto de tipo `ModProfesorInputs` recopilando el DNI, los datos modificados, y extrayendo el ID de escuela y de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `servicioProfesor.modProfesor` y el mapa de códigos de error/éxito (`MAPA_MOD_PROFESORES`).
 *
 * @async
 * @function modProfesores
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta, el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PUT esperada:
 * // /profesores/35123456
 * // Body: { "nombre": "Juan Carlos", "apellido": "Pérez", "celular": "3874123456" }
 */
const modProfesores = async ( req : Request , res : Response )  => {

    const {dni } = req.params;
    const { nombre , apellido , celular} = req.body ;

    const dataMod : ModProfesorInputs= {
        dni         : dni, 
        id_escuela  : Number(req.usuario?.id_escuela),
        id_usuario  : Number(req.usuario?.id),
        nombre      : nombre,    
        apellido    : apellido ,
        celular     : celular
    };
    

    await handleControladores<ModProfesorInputs,ProfesoresGlobales >(
        res, dataMod, servicioProfesor.modProfesor, MAPA_MOD_PROFESORES
    );
};

/**
 * Controlador encargado de gestionar la petición HTTP para cambiar el estado (activar/inactivar) de un profesor en la escuela.
 * Extrae el DNI y el nuevo estado de los parámetros de la ruta (`params`) y los datos del usuario autenticado,
 * construyendo el objeto de entrada tipado para delegar la ejecución al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `dni` y `estado` de los parámetros de la ruta (`params`).
 * 2. Construye el objeto de tipo `EstadoProfesorInputs` recopilando el DNI, el estado, y extrayendo el ID de escuela y de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `servicioProfesor.estadoProfesor` y el mapa de códigos de error/éxito (`MAPA_ESTADO_PROFESORES`).
 *
 * @async
 * @function estadoProfesor
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PATCH esperada:
 * // /profesores/35123456/inactivo
 */
const estadoProfesor = async ( req : Request , res : Response ) => {
 
    const {dni , estado} = req.params ;
    const data :  EstadoProfesorInputs  = {
        dni : dni , 
        id_escuela : Number(req.usuario?.id_escuela) , 
        estado : estado,
        id_usuario : Number(req.usuario?.id) 
    };

    await handleControladores<EstadoProfesorInputs, FiltroProfeEscuelaBaja>(
        res, data, servicioProfesor.estadoProfesor, MAPA_ESTADO_PROFESORES
    );

};


/**
 * Controlador encargado de gestionar la petición HTTP para listar los profesores con soporte para paginación y filtros.
 * Extrae los parámetros de la consulta (`query`), calcula el `offset`, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros `dni`, `apellido`, `estado`, `limit` y `pagina` de la query de la petición.
 * 2. Calcula el desplazamiento (`offset`) utilizando la página y el límite especificados.
 * 3. Construye el objeto de tipo `ListadoProfeInputs` recopilando el DNI, apellido, estado, ID de escuela (extraído del usuario autenticado), límite, offset y página.
 * 4. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `servicioProfesor.listadoProfesor` y el mapa de códigos de error/éxito (`MAPA_LISTADO_PROFESORES`).
 *
 * @async
 * @function listadoProfesores
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de consulta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición GET esperada:
 * // /profesores?pagina=1&limit=10&estado=activos&apellido=Perez
 */
const listadoProfesores = async( req : Request , res : Response ) => {
    

    const { dni , apellido , estado , limit , pagina} = req.query;  

    const offset = ( Number(pagina) -1 ) * Number(limit) ;

    const dataListado : ListadoProfeInputs = {
        dni : String(dni),
        apellido : String(apellido),
        estado : String(estado) as 'activos' | 'inactivos',
        id_escuela : Number(req.usuario?.id_escuela),
        limit  : Number(limit),
        offset : Number(offset),       
        pagina : Number(pagina)
    };

    await handleControladores<ListadoProfeInputs, ResulListadoProfesoresUsuarios[]>(
        res, dataListado, servicioProfesor.listadoProfesor, MAPA_LISTADO_PROFESORES
    );
   
};


/**
 * Controlador encargado de gestionar la petición HTTP para listar los profesores sin paginación, aplicando filtros opcionales.
 * Extrae los parámetros de la consulta (`query`) y los datos de la sesión del usuario, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros `dni` y `estado` de la query de la petición.
 * 2. Construye el objeto de tipo `ListadoProfeSinPagInputs` recopilando el DNI, el estado y el ID de escuela extraído del usuario autenticado.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `servicioProfesor.listadoProfesorSinPag` y el mapa de códigos de error/éxito (`MAPA_LISTADO_SIN_PAG_PROFESORES`).
 *
 * @async
 * @function ListadoSinPaginacion
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de consulta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición GET esperada:
 * // /profesores/sin-paginacion?estado=activos&dni=35123456
 */
const ListadoSinPaginacion = async( req : Request , res : Response ) => {
    const { dni , estado  } = req.query;


    const dataListado : ListadoProfeSinPagInputs = {
        dni : String(dni),
        estado : estado as  "activos" | "inactivos" | "todos",
        id_escuela : Number(req.usuario?.id_escuela)        
    };


    await handleControladores<ListadoProfeSinPagInputs, ListadoProfeResults[]>(
        res, dataListado, servicioProfesor.listadoProfesorSinPag,   MAPA_LISTADO_SIN_PAG_PROFESORES
    );

};

export const method = {
    alta    : tryCatch( altaProfesores ),
    mod     : tryCatch( modProfesores ),
    estado  : tryCatch( estadoProfesor ), 
    listado : tryCatch( listadoProfesores),
    listadoSinPaginacion : tryCatch( ListadoSinPaginacion )
}