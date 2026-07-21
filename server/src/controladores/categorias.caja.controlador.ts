import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { method as categoriaCajaServicio } from "../Servicio/categoria.cajas.serivcio";
import { enviarResponse } from "../utils/response";
import { handleControladores } from "../utils/handleControladores";
import { enviarResponseError } from "../utils/responseError";

import { MAPA_LOCALIZAR_INSCRIPCION_CATEGORIA_CAJA, ERROR_INTERNO_SERVIDOR, MAPA_ALTA_CATEGORIA_CAJA,
         MAPA_MOD_CATEGORIA_CAJA,  MAPA_ESTADO_CATEGORIA_CAJA, MAPA_LISTADO_CATEGORIA_CAJA
 } from "../respuestas/categoria.cajas";

 import { CategoriaCajaInpurts, ModCategoriaCajaInputs ,  
          BajaCategoriCajaInputs, ListadoCategoriaCajaInputs, 
 }  from "../squemas/categoria.caja";


import { DataCategoriaCajas, ResultListadoCategoriaCaja } from "../tipados/categoria.caja.tiapado";

// ──────────────────────────────────────────────────────────────
// Sección de tipados
// ──────────────────────────────────────────────────────────────
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * Controlador para buscar el ID de la categoría 'Inscripcion' de una escuela específica.
 * * Esta función extrae el id_escuela de los parámetros de la ruta, consulta el servicio
 * de categorías y devuelve una respuesta estructurada. Es vital para procesos de 
 * automatización donde el sistema necesita identificar la categoría de ingreso base.
 *
 * @param {Request} req - Objeto de petición de Express. Debe contener id_escuela en params.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Devuelve una respuesta HTTP con el resultado de la búsqueda:
 * - 200 (OK): Categoría encontrada exitosamente.
 * - 404 (NOT_FOUND): La escuela no tiene una categoría de 'Inscripcion' definida.
 * - 500 (INTERNAL_SERVER_ERROR): Error inesperado en el servicio o base de datos.
 */
const buscarInscripcionCategoria = async ( req : Request, res : Response ) =>{   
    const data = { id_escuela : Number( req.usuario?.id_escuela)};

    const inscripcionCategoriaResult = await categoriaCajaServicio.verificacionInscripcionCategoria(data);

    const config = MAPA_LOCALIZAR_INSCRIPCION_CATEGORIA_CAJA[ inscripcionCategoriaResult.code ]  || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
         return enviarResponse(
            res,
            config.status,
            inscripcionCategoriaResult.message || config.msg ,
            inscripcionCategoriaResult.data,
            undefined,
            inscripcionCategoriaResult.code
        );       
    }else{
        return enviarResponseError(
            res,
            config.status,
            inscripcionCategoriaResult.message || config.msg ,
            inscripcionCategoriaResult.code
        );
    };

};


/**
 * Controlador encargado de procesar la solicitud para registrar una nueva categoría de caja,
 * extrayendo los datos desde el cuerpo de la petición (`req.body`) y combinándolos 
 * con la información de contexto del usuario y la escuela autenticados.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los campos requeridos (`nombre_categoria`, `tipo_movimiento`, `estado`) directamente desde `req.body`.
 * 2. Asocia automáticamente el `id_escuela` y el `id_usuario` a partir de la sesión del usuario autenticado (`req.usuario`), asegurando su conversión a número.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto `data`, el servicio correspondiente (`categoriaCajaServicio.altaCategoriaCajaServicio`) y el mapa de códigos de la operación.
 *
 * @async
 * @function altaCategoriaCaja
 * @param {Request} req - Objeto de petición de Express, que contiene los datos de la nueva categoría en el `body` 
 * y la información del usuario autenticado en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado del alta.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante el flujo de `handleControladores`.
 * 
 * @example
 * // Petición HTTP POST esperada:
 * // /api/categorias-caja
 * // Body: { "nombre_categoria": "Cuotas Mensuales", "tipo_movimiento": "ingreso", "estado": "activos" }
 */
const altaCategoriaCaja = async( req : Request, res : Response) => {
    const data = {
        nombre_categoria: req.body.nombre_categoria,
        tipo_movimiento: req.body.tipo_movimiento,
        estado: req.body.estado,
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };
    
    await handleControladores<CategoriaCajaInpurts,DataCategoriaCajas>(
        res, data , categoriaCajaServicio.altaCategoriaCajaServicio, MAPA_ALTA_CATEGORIA_CAJA
    );

};

/**
 * Controlador encargado de procesar la solicitud para modificar una categoría de caja,
 * extrayendo los datos desde los parámetros de la ruta (`req.params`) y combinándolos 
 * con la información del usuario y escuela autenticados.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de la URL (`id`, `nombre`, `movimiento`, `estado`) desde `req.params`.
 * 2. Construye el objeto `data` tipado como `ModCategoriaCajaInputs`, asegurando la conversión de IDs a números 
 *    y aplicando el casting correspondiente para los tipos de movimiento y estado.
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`categoriaCajaServicio.modCategoriaCaja`) y el mapa de códigos de la operación.
 *
 * @async
 * @function modCategoriaCaja
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de ruta con la información 
 * de la categoría a modificar y los datos de sesión en `req.usuario`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la modificación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP a través de `handleControladores`.
 * 
 * @example
 * // Petición HTTP PUT esperada:
 * // /api/categorias-caja/2/Gastos/egreso/activos
 */
const modCategoriaCaja = async( req : Request, res : Response) =>{

    const data : ModCategoriaCajaInputs = {
        id_categoria    : Number(req.params.id),
        nombre_categoria: req.params.nombre,
        tipo_movimiento : req.params.movimiento as "ingreso" | "egreso",
        estado          : req.params.estado as "activos" | "inactivos",
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };

   await handleControladores<ModCategoriaCajaInputs,{id_categoria : number} >(
        res, data, categoriaCajaServicio.modCategoriaCaja, MAPA_MOD_CATEGORIA_CAJA 
   ); 
    
};

/**
 * Controlador encargado de procesar la solicitud para cambiar el estado (baja o activación) 
 * de una categoría de caja, extrayendo los parámetros de la ruta (`req.params`) 
 * y delegando la ejecución al manejador genérico.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros de ruta necesarios (`id`, `estado`, `nombre_categoria`) y los combina 
 *    con la información del usuario autenticado (`req.usuario`) para construir el objeto `dataBaja`.
 * 2. Asegura el casting correcto de los tipos (convirtiendo ID de escuela, ID de categoría e ID de usuario a número, 
 *    y tipando explícitamente el estado).
 * 3. Ejecuta `handleControladores` pasando la respuesta (`res`), el objeto de datos, el servicio 
 *    correspondiente (`categoriaCajaServicio.bajaCategoriaCaja`) y el mapa de códigos de la operación.
 *
 * @async
 * @function bajaCategoriaCaja
 * @param {Request} req - Objeto de petición de Express, que contiene los parámetros de ruta (`id`, `estado`, `nombre_categoria`) 
 * y la información del usuario autenticado (`req.usuario`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado de la operación.
 * 
 * @returns {Promise<void>} No retorna un valor directo; gestiona la respuesta HTTP mediante `handleControladores`.
 * 
 * @example
 * // Petición HTTP PATCH o DELETE esperada:
 * // /api/categorias-caja/3/inactivos/Ventas
 */
const bajaCategoriaCaja = async( req : Request, res : Response ) => {

    const dataBaja : BajaCategoriCajaInputs = {
        id_escuela : Number(req.usuario?.id_escuela),
        id_categoria : Number(req.params.id),
        estado : req.params.estado as "activos" | "inactivos",
        nombre_categoria : req.params.nombre_categoria,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<BajaCategoriCajaInputs,BajaCategoriCajaInputs >(
        res, dataBaja, categoriaCajaServicio.bajaCategoriaCaja, MAPA_ESTADO_CATEGORIA_CAJA
    );
    

};

/**
 * Controlador para la obtención del listado de categorías de caja.
 * * Extrae los parámetros de filtrado y paginación desde la query de la petición,
 * invoca al servicio correspondiente y gestiona la respuesta HTTP utilizando
 * un mapeo de configuraciones para estandarizar los estados.
 *
 * @async
 * @function listadoCategoriaCaja
 * @param {import('express').Request} req - Objeto de petición de Express.
 * @param {Object} req.query - Parámetros de consulta (query strings).
 * @param {string} [req.query.categoria] - Nombre de la categoría para filtrar.
 * @param {string} [req.query.tipo] - Tipo de movimiento para filtrar.
 * @param {string} [req.query.estado] - Estado de la categoría para filtrar.
 * @param {string|number} [req.query.limite] - Cantidad de registros por página.
 * @param {string|number} [req.query.pagina] - Número de página solicitado.
 * @param {Object} [req.usuario] - Objeto de usuario inyectado por el middleware de autenticación.
 * @param {number} req.usuario.id_escuela - ID de la escuela del usuario autenticado.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<void>} No retorna un valor directo, envía la respuesta a través de `enviarResponse` o `enviarResponseError`.
 */
const listadoCategoriaCaja = async( req : Request, res : Response) =>{
    
    const data : ListadoCategoriaCajaInputs = {
        nombre_categoria : req.query.categoria as string,
        tipo_movimiento  : req.query.tipo as "ingreso" | "egreso" | "%",
        estado           : req.query.estado as "activos" | "inactivos",
        id_escuela       : Number(req.usuario?.id_escuela),
        limit            : Number(req.query.limite),
        pagina : Number(req.query.pagina)
    };
    
    await handleControladores<ListadoCategoriaCajaInputs,ResultListadoCategoriaCaja[]>(
        res, data ,categoriaCajaServicio.listadoCategoriaCaja, MAPA_LISTADO_CATEGORIA_CAJA
    );

};

export const method = {
    altaCategoriaCaja : tryCatch(altaCategoriaCaja),
    modCategoriaCaja  : tryCatch(modCategoriaCaja),
    bajaCategoriaCaja : tryCatch(bajaCategoriaCaja),
    listadoCategoriaCaja : tryCatch( listadoCategoriaCaja ),
    buscarInscripcionCategoria : tryCatch( buscarInscripcionCategoria )
};


