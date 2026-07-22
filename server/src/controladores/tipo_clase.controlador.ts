import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a serbivios para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────

import { method as servicioTipo}  from "../Servicio/tipo.clase.servicio";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch"; 
import { fechaHoy } from "../hooks/fecha";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { MAPA_ALTA_TIPO_CLASE,MAPA_MOD_TIPO_CLASE,
         MAPA_ESTADO_TIPO_CLASE, MAPA_LISTADO_TIPO_CLASE
 } from "../respuestas/tipo.clase";     

 import { ResulListadoTipoUsuarios } from "../tipados/tipo.data";
 
 import {  CrearTipoInput , ModTipoInput , 
           EstadoTipoInput , ListadoTipoInput,
           ListadoTipoSinPagInput
        } from "../squemas/tipo.usuarios";



/**
 * Controlador encargado de procesar la solicitud para registrar un nuevo tipo de clase (baile),
 * extrayendo el nombre desde el cuerpo de la petición (`req.body`), asignando la fecha actual 
 * y combinando los datos con la información de contexto de la escuela y el usuario autenticado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el campo `tipo` directamente desde `req.body`.
 * 2. Construye el objeto `dataAlta` tipado como `CrearTipoInput`, asignando la fecha actual mediante `fechaHoy()`, 
 *    y convirtiendo el `id_escuela` y el `id_usuario` de la sesión a números.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioTipo.altaTipoClase`) y el mapa de códigos de la operación.
 *
 * @async
 * @function altaTipo
 * @param {Request} req - Objeto de petición de Express, que contiene los datos del nuevo tipo de clase en el `body` 
 * y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado del alta.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante el flujo de `handleControladores`.
 * 
 * @example
 * // Petición HTTP POST esperada:
 * // /api/tipos-clase
 * // Body: { "tipo": "Tango" }
 */
const altaTipo = async( req : Request, res : Response) =>{
   const { tipo }  = req.body;

    const dataAlta : CrearTipoInput = {
        tipo : tipo,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)        
    };
    
    await handleControladores<CrearTipoInput,{tipo : string} >(
        res, dataAlta, servicioTipo.altaTipoClase, MAPA_ALTA_TIPO_CLASE
    );

};



/**
 * Controlador encargado de procesar la solicitud para modificar un tipo de clase (baile) existente,
 * extrayendo el nuevo nombre desde el cuerpo (`req.body`) y el ID desde los parámetros de la ruta (`req.params`),
 * para luego delegar la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el campo `tipo` desde `req.body` y el `id` desde `req.params`.
 * 2. Construye el objeto `tipoMod` tipado como `ModTipoInput`, asociando el ID del tipo, el ID de la escuela 
 *    y el ID del usuario autenticado debidamente convertidos a números.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioTipo.modTipoClase`) y el mapa de códigos de la operación.
 *
 * @async
 * @function modTipo
 * @param {Request} req - Objeto de petición de Express, que contiene el nuevo nombre en el `body`, 
 * el ID en los parámetros de ruta (`req.params`) y la información de sesión en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la modificación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP PUT o PATCH esperada:
 * // /api/tipos-clase/1
 * // Body: { "tipo": "Salsa Cubana" }
 */
const modTipo = async( req : Request, res : Response ) => {
    const { tipo } = req.body;
    const { id } = req.params;

    const tipoMod : ModTipoInput = {
        tipo : tipo,
        id   : Number(id),
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<ModTipoInput, {id: number , tipo : string}>(
        res, tipoMod, servicioTipo.modTipoClase,  MAPA_MOD_TIPO_CLASE
    );

};


/**
 * Controlador encargado de procesar la solicitud para cambiar el estado (activación o baja lógica) 
 * de un tipo de clase (baile), extrayendo los parámetros de la ruta (`req.params`) 
 * y delegando la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de ruta necesarios (`id`, `estado`) desde `req.params`.
 * 2. Construye el objeto `estadoData` tipado como `EstadoTipoInput`, realizando el casting del estado 
 *    y convirtiendo el ID del tipo, el ID de la escuela y el ID del usuario a número.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioTipo.estadoTipo`) y el mapa de códigos de la operación.
 *
 * @async
 * @function estadoTipo
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de ruta (`id`, `estado`) 
 * y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la operación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP PATCH esperada:
 * // /api/tipos-clase/1/inactivos
 */
const estadoTipo = async( req : Request, res : Response ) =>{
    const { id , estado} = req.params;

    const estadoData : EstadoTipoInput = {
         estado : estado as "activos" | "inactivos" | "todos",  
         id : Number(id) , 
         id_escuela : Number(req.usuario?.id_escuela),
         id_usuario : Number(req.usuario?.id)
    };


    await handleControladores<EstadoTipoInput ,{ id: number }>(
        res, estadoData,  servicioTipo.estadoTipo, MAPA_ESTADO_TIPO_CLASE
    );

};


/**
 * Controlador encargado de procesar la solicitud para obtener el listado paginado de tipos de clase (baile),
 * calculando el offset a partir de la página y el límite, y combinando los filtros con la escuela del usuario.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de consulta (`tipo`, `estado`, `pagina`, `limite`) desde `req.query`.
 * 2. Calcula el valor del `offset` para la paginación usando la fórmula: `(pagina - 1) * limite`.
 * 3. Construye el objeto `dataListado` tipado como `ListadoTipoInput`, realizando la conversión numérica de los campos 
 *    requeridos y el casting de los filtros.
 * 4. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioTipo.listadoTipoClases`) y el mapa de códigos de la operación.
 *
 * @async
 * @function listadoTipo
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de consulta (`req.query`) 
 * con la paginación y filtros, además de la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el listado paginado.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/tipos-clase?pagina=1&limite=10&estado=activos
 */
const listadoTipo = async( req : Request, res : Response ) =>{
    const { tipo , estado , pagina , limite } = req.query;
  
    const offset = ( Number(pagina) -1 ) * Number(limite) ;

    const dataListado :  ListadoTipoInput = {
        tipo : tipo as "activos" | "inactivos" | "todos",
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number(req.usuario?.id_escuela),
        limite     : Number(limite),
        offset : offset,
        pagina : Number(pagina)    
    };

    
    await handleControladores< ListadoTipoInput, ResulListadoTipoUsuarios[]>(
        res, dataListado, servicioTipo.listadoTipoClases,  MAPA_LISTADO_TIPO_CLASE
    );
};


/**
 * Controlador encargado de procesar la solicitud para obtener el listado de tipos de clase (baile) sin paginación,
 * extrayendo los filtros desde los parámetros de consulta (`req.query`) y combinándolos 
 * con la información de la escuela del usuario autenticado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los filtros opcionales de consulta (`tipo`, `estado`) desde `req.query`.
 * 2. Construye el objeto `dataListado` tipado como `ListadoTipoSinPagInput`, asegurando el casting de los filtros 
 *    y convirtiendo el `id_escuela` del usuario a número.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioTipo.listadoTipoClasesSinPag`) y el mapa de códigos de la operación.
 *
 * @async
 * @function listadoTipoSinPaginacion
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de consulta (`req.query`) 
 * y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el listado obtenido.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/tipos-clase/listado?estado=activos
 */
const listadoTipoSinPaginacion = async( req : Request , res : Response)=>{

    const { tipo , estado } = req.query;

    const dataListado : ListadoTipoSinPagInput= {
        tipo : tipo as  "activos" | "inactivos" | "todos",
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number(req.usuario?.id_escuela)      
    };

    await handleControladores<ListadoTipoSinPagInput ,{ id : number, tipo : string}[]>(
        res, dataListado, servicioTipo.listadoTipoClasesSinPag,  MAPA_LISTADO_TIPO_CLASE
    );

};

export const method = {
    registro : tryCatch( altaTipo ),
    modTipo  : tryCatch( modTipo ),
    estado   : tryCatch( estadoTipo),
    listado  : tryCatch( listadoTipo),
    listadoSinPaginacion : tryCatch( listadoTipoSinPaginacion)
};