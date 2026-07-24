// FILE: planes.usuarios.controller.ts
// DESCRIPCIÓN:
// Este controlador maneja la lógica de negocio para la gestión de Planes de Pago (Planes Maestros)
// y su asignación o personalización a Escuelas (Planes en Escuela). Utiliza el patrón
// tryCatch para manejar errores de forma centralizada y esquemas de validación (Zod/Joi)
// para asegurar la integridad de los datos de entrada.

import { Response , Request } from "express";


import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";


import { fechaHoy } from "../hooks/fecha";
import { method as planesServicio } from "../Servicio/planes.usuario";
import { handleControladores } from "../utils/handleControladores";


import { 
	    MAPA_ALTA_PLAN, MAPA_MOD_PLAN,
	    MAPA_ESTADO_PLAN, MAPA_LISTADO_PLAN
 } from "../respuestas/planes.usuario";	

// Seccion de Typados 



// Seccion de Typados de Esquemas (Inputs) - Necesarios para la validación
import {
		PlanesPagoInputs, ModPlanesUsuariosInputs,
		estadoPlanesUsuariosInputs, ListaPlanesUsuariosInputs,
		ListaPlanesUsuarioSinPagInputs ,
	} from "../squemas/planes.usuarios";
import type { ResultBusquedaPlanes, ModPlanesUsuariosResult,estadoPlanesUsuarios,
    ResulListadoPlanesUsuarios
 } from "../tipados/planes.usuarios"; 



/**
 * Controlador encargado de gestionar la petición HTTP para dar de alta un nuevo plan de pago para la escuela.
 * Extrae los datos del cuerpo de la petición (`body`), complementa la información con valores predeterminados (como el estado inicial y la fecha actual)
 * y los datos de la sesión del usuario autenticado, construyendo el objeto de entrada tipado para delegar la ejecución
 * al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `cantidad_clases`, `cantidad_meses`, `monto` y `descripcion` del cuerpo de la solicitud (`body`).
 * 2. Construye el objeto de tipo `PlanesPagoInputs` estructurando la descripción, convirtiendo las cantidades y el monto a sus tipos numéricos correspondientes, asignando por defecto el estado "activos", generando la fecha actual con `fechaHoy()`, y extrayendo el ID de escuela y de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `planesServicio.altaPlanes` y el mapa de códigos de error/éxito (`MAPA_ALTA_PLAN`).
 *
 * @async
 * @function altaPlanes_usuarios
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición POST esperada:
 * // /planes
 * // Body: { "descripcion": "Plan Estándar", "cantidad_clases": 8, "cantidad_meses": 1, "monto": 10000 }
 */
const altaPlanes_usuarios = async( req : Request , res : Response ) =>{

	const {  cantidad_clases , cantidad_meses , monto , descripcion} = req.body;

	const datosEntrada : PlanesPagoInputs = {
		descripcion  	: descripcion as string,
		cantidad_clases : Number(cantidad_clases),
		cantidad_meses :  Number(cantidad_meses),
		monto          : parseFloat( monto),
		estado         : "activos", // como es alta siempre sera activos
		fecha_creacion : fechaHoy() , // funcion q diga la fecha aactual
		id_escuela     : Number(req.usuario?.id_escuela),
		id_usuario     : Number(req.usuario?.id)
	};



	await handleControladores<PlanesPagoInputs,ResultBusquedaPlanes >(
		res, datosEntrada, planesServicio.altaPlanes,  MAPA_ALTA_PLAN
	);
	
};

/**
 * Controlador encargado de gestionar la petición HTTP para modificar los datos de un plan de usuario existente.
 * Extrae el ID del plan de los parámetros de la ruta, los datos actualizados del cuerpo de la petición (`body`),
 * y la información del usuario autenticado, construyendo el objeto de entrada tipado para delegar la ejecución
 * al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae el `id_plan` de los parámetros de la ruta (`params`) y `descripcion`, `cantidad_clases`, `cantidad_meses` y `monto` del cuerpo de la solicitud (`body`).
 * 2. Construye el objeto de tipo `ModPlanesUsuariosInputs` recopilando el ID del plan, nombre personalizado (con la descripción), fecha actual (`fechaHoy()`), cantidades convertidas a número, monto y extrayendo el ID de escuela y de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `planesServicio.modPlanesUsuarios` y el mapa de códigos de error/éxito (`MAPA_MOD_PLAN`).
 *
 * @async
 * @function modPlanes_usuarios
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta, el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PUT esperada:
 * // /planes/3
 * // Body: { "descripcion": "Plan Promoción", "cantidad_clases": 12, "cantidad_meses": 1, "monto": 15000 }
 */
const modPlanes_usuarios = async( req : Request , res : Response ) =>{

	const { id_plan  } = req.params;
	const { descripcion , cantidad_clases, cantidad_meses,  monto } = req.body;

	const dataPlan :  ModPlanesUsuariosInputs = {
		id_plan : Number(id_plan),
		id_escuela : Number(req.usuario?.id_escuela),
		nombre_personalizado : descripcion,
		fecha_creacion : fechaHoy(), // colocar funcion fecha hoy
		cantidad_clases :Number(cantidad_clases),
		cantidad_meses  : Number(cantidad_meses),
		monto  : Number(monto),
		id_usuario : Number(req.usuario?.id)
	};

	await handleControladores< ModPlanesUsuariosInputs,ModPlanesUsuariosResult >(
		res, dataPlan, planesServicio.modPlanesUsuarios,  MAPA_MOD_PLAN
	);

};


/**
 * Controlador encargado de gestionar la petición HTTP para cambiar el estado (activar/inactivar) de un plan de usuario.
 * Extrae el ID del plan y el nuevo estado de los parámetros de la ruta (`params`) y los datos del usuario autenticado,
 * construyendo el objeto de entrada tipado para delegar la ejecución al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae `id_plan` y `estado` de los parámetros de la ruta (`params`).
 * 2. Construye el objeto de tipo `estadoPlanesUsuariosInputs` recopilando el ID del plan convertido a número, el estado, y extrayendo el ID de escuela y de usuario de la sesión autenticada.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `planesServicio.estadoPlan` y el mapa de códigos de error/éxito (`MAPA_ESTADO_PLAN`).
 *
 * @async
 * @function estadoPlanes_usuarios
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PATCH esperada:
 * // /planes/3/inactivo
 */
const estadoPlanes_usuarios = async( req : Request , res : Response ) =>{
	const { id_plan, estado} = req.params;


	const dataEstado : estadoPlanesUsuariosInputs = {
		id_plan : Number(id_plan),
		id_escuela : Number(req.usuario?.id_escuela),
		estado : estado as "activos" | "inactivos",
		id_usuario : Number(req.usuario?.id)			
	};

	await handleControladores<estadoPlanesUsuariosInputs,estadoPlanesUsuarios >(
		res, dataEstado, planesServicio.estadoPlan, MAPA_ESTADO_PLAN
	);	

};


/**
 * Controlador encargado de gestionar la petición HTTP para listar los planes de usuario con soporte para paginación y filtros.
 * Extrae los parámetros de la consulta (`query`), calcula el `offset`, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros `descripcion`, `estado`, `limit` y `pagina` de la query de la petición.
 * 2. Calcula el desplazamiento (`offset`) utilizando la página y el límite especificados.
 * 3. Construye el objeto de tipo `ListaPlanesUsuariosInputs` recopilando la descripción, el estado, límite, offset, ID de escuela (extraído del usuario autenticado) y número de página.
 * 4. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `planesServicio.listadoPlanes` y el mapa de códigos de error/éxito (`MAPA_LISTADO_PLAN`).
 *
 * @async
 * @function listadoPlanesUsuarios
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de consulta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición GET esperada:
 * // /planes?pagina=1&limit=10&estado=activos&descripcion=Mensual
 */
const listadoPlanesUsuarios = async( req : Request , res : Response ) =>{
	const {descripcion , estado ,limit , pagina} = req.query;

	// Calcular el offset para la consulta SQL, necesario para la paginación.
	const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
	const dataListado : ListaPlanesUsuariosInputs = {
		descripcion : String(descripcion) ,
		estado : String(estado) as 'activos' | 'inactivos' | 'todos',
		limite : Number(limit),
		offset : Number(offset),
		id_escuela : Number(req.usuario?.id_escuela),
		pagina  : Number( pagina )
	};

	await handleControladores<ListaPlanesUsuariosInputs,ResulListadoPlanesUsuarios[] >(
		res, dataListado, planesServicio.listadoPlanes, MAPA_LISTADO_PLAN
	);

};

/**
 * Controlador encargado de gestionar la petición HTTP para listar los planes de usuario sin paginación, aplicando filtros opcionales.
 * Extrae los parámetros de la consulta (`query`) y los datos de la sesión del usuario, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros `descripcion` y `estado` de la query de la petición.
 * 2. Construye el objeto de tipo `ListaPlanesUsuarioSinPagInputs` recopilando la descripción, el estado y el ID de escuela extraído del usuario autenticado.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `planesServicio.listadoPlanesSinPag` y el mapa de códigos de error/éxito (`MAPA_LISTADO_PLAN`).
 *
 * @async
 * @function listadoPlanesSinPag
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de consulta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición GET esperada:
 * // /planes/sin-paginacion?estado=activos&descripcion=Mensual
 */
const listadoPlanesSinPag = async( req : Request , res : Response ) =>{
	const { descripcion , estado } = req.query;

	const parametrosUrl : ListaPlanesUsuarioSinPagInputs = {
		descripcion : descripcion as "activos" | "inactivos" | "todos"  ,
		estado : estado as "activos" | "inactivos" | "todos" ,
		id_escuela : Number(req.usuario?.id_escuela)
	};

	await handleControladores<ListaPlanesUsuarioSinPagInputs, ResulListadoPlanesUsuarios[] >(
		res, parametrosUrl, planesServicio.listadoPlanesSinPag, MAPA_LISTADO_PLAN
	);

};

// Objeto que exporta los métodos del controlador envueltos en la utilidad tryCatch
export const method = {
	altaPlanes_usuarios 	 : tryCatch(altaPlanes_usuarios),
	modPlanes_usuarios 	 	 : tryCatch(modPlanes_usuarios),
	estadoPlanes_usuarios 	 : tryCatch(estadoPlanes_usuarios),
	listadoPlanesUsuarios 	 : tryCatch(listadoPlanesUsuarios),
	listadoSinPag            : tryCatch( listadoPlanesSinPag)
}