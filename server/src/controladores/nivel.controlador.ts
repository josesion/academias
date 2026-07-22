import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a servicios para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────

import { method as servicioNiveles } from "../Servicio/niveles.servicio";

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { tryCatch } from "../utils/tryCatch"; 

import { fechaHoy } from "../hooks/fecha"; 

import { MAPA_ALTA_NIVEL,  MAPA_MOD_NIVEL,
         MAPA_ESTADO_NIVEL, MAPA_LISTADO_NIVEL,
 } from "../respuestas/niveles";

import { ResulListadoNivelUsuarios } from "../tipados/nivel.data";

import { CrearNivelInput ,  ModificarNivelInput, 
          EstadoNivelInput, ListadoNivelInput, ListadoNivelSinPagInput
        } from "../squemas/nivel";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────



/**
 * Controlador encargado de procesar la solicitud para registrar un nuevo nivel,
 * extrayendo el nombre desde el cuerpo de la petición (`req.body`), asignando la fecha actual, 
 * un valor por defecto para `is_default` y combinando los datos con la información de contexto 
 * de la escuela y el usuario autenticado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el campo `nivel` directamente desde `req.body`.
 * 2. Construye el objeto `dataNivel` tipado como `CrearNivelInput`, asignando la fecha actual mediante `fechaHoy()`, 
 *    estableciendo `is_default` en falso, y convirtiendo el `id_escuela` y el `id_usuario` de la sesión a números.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioNiveles.altaNivel`) y el mapa de códigos de la operación.
 *
 * @async
 * @function altaNivel
 * @param {Request} req - Objeto de petición de Express, que contiene los datos del nuevo nivel en el `body` 
 * y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado del alta.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante el flujo de `handleControladores`.
 * 
 * @example
 * // Petición HTTP POST esperada:
 * // /api/niveles
 * // Body: { "nivel": "Principiante" }
 */
const altaNivel = async ( req : Request , res : Response ) => {

    const  { nivel} = ( req.body );

    const dataNivel : CrearNivelInput = {
        nivel,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(req.usuario?.id_escuela),
        is_default : false,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores< CrearNivelInput, { nivel : string }>(
        res, dataNivel, servicioNiveles.altaNivel, MAPA_ALTA_NIVEL
    );
};


/**
 * Controlador encargado de procesar la solicitud para modificar un nivel existente,
 * extrayendo el ID desde los parámetros de la ruta (`req.params`) y el nuevo nombre 
 * desde el cuerpo de la petición (`req.body`), para luego delegar la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el `id` desde `req.params` y el campo `nivel` desde `req.body`.
 * 2. Construye el objeto `modData` tipado como `ModificarNivelInput`, convirtiendo el ID del nivel, 
 *    el ID de la escuela y el ID del usuario de la sesión a números.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioNiveles.modNivel`) y el mapa de códigos de la operación.
 *
 * @async
 * @function modNivel
 * @param {Request} req - Objeto de petición de Express, que contiene el ID en los parámetros de ruta (`req.params`), 
 * el nuevo nivel en el `body` (`req.body`) y la información de sesión en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la modificación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP PUT o PATCH esperada:
 * // /api/niveles/1
 * // Body: { "nivel": "Intermedio-Avanzado" }
 */
const modNivel = async ( req : Request , res : Response ) => {
   
    const { id } = req.params;
    const { nivel } = req.body;

    const modData : ModificarNivelInput = {
        id : Number(id),
        nivel,
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)   
    };

    await handleControladores<ModificarNivelInput, { nivel : string}>(
        res, modData, servicioNiveles.modNivel, MAPA_MOD_NIVEL
    );
};


/**
 * Controlador encargado de procesar la solicitud para cambiar el estado (activación o baja lógica) 
 * de un nivel, extrayendo el ID y el estado de los parámetros de la ruta (`req.params`), 
 * el nivel del cuerpo (`req.body`), y delegando la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de ruta (`id`, `estado`) desde `req.params` y el campo `nivel` desde `req.body`.
 * 2. Construye el objeto `estadoData` tipado como `EstadoNivelInput`, realizando el casting del estado 
 *    y convirtiendo el ID del nivel, el ID de la escuela y el ID del usuario a números.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioNiveles.estadoNivel`) y el mapa de códigos de la operación.
 *
 * @async
 * @function estadoNivel
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de ruta (`id`, `estado`), 
 * el cuerpo de la petición (`req.body`) y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la operación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP PATCH esperada:
 * // /api/niveles/1/inactivos
 * // Body: { "nivel": "Avanzado" }
 */
const estadoNivel = async(req : Request , res : Response )=> {

    const { id  , estado  } = req.params;
    const { nivel } = req.body ;
 
    const estadoData : EstadoNivelInput = {
        id : Number(id), 
        id_escuela : Number(req.usuario?.id_escuela),
        estado : estado as "activos" | "inactivos",
        nivel : nivel,
        id_usuario : Number(req.usuario?.id)     
    };

    await handleControladores< EstadoNivelInput ,{ id : number }>(
        res, estadoData, servicioNiveles.estadoNivel, MAPA_ESTADO_NIVEL
    );
};

/**
 * Controlador encargado de procesar la solicitud para obtener el listado paginado de niveles,
 * calculando el offset a partir de la página y el límite, y combinando los filtros con la escuela del usuario.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de consulta (`nivel`, `estado`, `limite`, `pagina`) desde `req.query`.
 * 2. Calcula el valor del `offset` para la paginación usando la fórmula: `(pagina - 1) * limite`.
 * 3. Construye el objeto `dataListado` tipado como `ListadoNivelInput`, realizando la conversión numérica de los campos 
 *    requeridos y el casting de los filtros.
 * 4. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioNiveles.listadoNivel`) y el mapa de códigos de la operación.
 *
 * @async
 * @function listadoNivel
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de consulta (`req.query`) 
 * con la paginación y filtros, además de la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el listado paginado.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/niveles?pagina=1&limite=10&estado=activos
 */
const listadoNivel = async( req : Request , res : Response ) =>{
   
    const { nivel , estado, limite, pagina} = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limite) ;

   const dataListado : ListadoNivelInput  = {
        nivel : nivel as string,
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number( req.usuario?.id_escuela ),
        limite : Number( limite ),
        offset  : Number( offset ),
        pagina : Number( pagina )    
   };

   await handleControladores< ListadoNivelInput  , ResulListadoNivelUsuarios[]>(
        res, dataListado, servicioNiveles.listadoNivel, MAPA_LISTADO_NIVEL
   );

};


/**
 * Controlador encargado de procesar la solicitud para obtener el listado de niveles sin paginación,
 * extrayendo los filtros desde los parámetros de consulta (`req.query`) y combinándolos 
 * con la información de la escuela del usuario autenticado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los filtros opcionales de consulta (`nivel`, `estado`) desde `req.query`.
 * 2. Construye el objeto `dataListado` tipado como `ListadoNivelSinPagInput`, asegurando el casting del estado 
 *    y convirtiendo el `id_escuela` del usuario a número.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`servicioNiveles.listadoNivelSinPag`) y el mapa de códigos de la operación.
 *
 * @async
 * @function listadoNivelSinPag
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de consulta (`req.query`) 
 * y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el listado obtenido.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP GET esperada:
 * // /api/niveles/listado?estado=activos
 */
const listadoNivelSinPag = async( req : Request , res : Response ) =>{
    const { nivel , estado } = req.query;

    const dataListado : ListadoNivelSinPagInput = {
        nivel : nivel as string,
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number( req.usuario?.id_escuela )          
    };

    await handleControladores<ListadoNivelSinPagInput,{}>(
        res, dataListado, servicioNiveles.listadoNivelSinPag, MAPA_LISTADO_NIVEL
    );
     
};

export const method = {
    altaNivel : tryCatch( altaNivel ),
    modNivel  : tryCatch( modNivel ),
    estadoNivel : tryCatch( estadoNivel),
    listadoNivel : tryCatch( listadoNivel),
    listadoNivelSinPag : tryCatch( listadoNivelSinPag )
};  