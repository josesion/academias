// FILE: planes.usuarios.controller.ts
// DESCRIPCIÓN:
// Este controlador maneja la lógica de negocio para la gestión de Planes de Pago (Planes Maestros)
// y su asignación o personalización a Escuelas (Planes en Escuela). Utiliza el patrón
// tryCatch para manejar errores de forma centralizada y esquemas de validación (Zod/Joi)
// para asegurar la integridad de los datos de entrada.

import { Response , Request } from "express";

// Seccion de Hooks (Utilidades)
// Importa el wrapper tryCatch para manejar excepciones asíncronas de manera segura.
import { tryCatch } from "../utils/tryCatch";

// Importa la función estandarizada para enviar respuestas HTTP.
import { enviarResponse } from "../utils/response";

import { fechaHoy } from "../hooks/fecha";

// Capa de acceso a la logica del servicio
import { method as planesServicio } from "../Servicio/planes.usuario";



import { 
	    MAPA_ALTA_PLAN, ERROR_INTERNO_SERVIDOR, MAPA_MOD_PLAN,
	    MAPA_ESTADO_PLAN, MAPA_LISTADO_PLAN
 } from "../respuestas/planes.usuario";	

// Seccion de Typados de Resultados y Códigos
import { CodigoEstadoHTTP } from "../tipados/generico";
import { enviarResponseError } from "../utils/responseError";


/**
 * Controlador para dar de alta un nuevo plan de usuario en la escuela.
 * * Extrae los datos del cuerpo de la petición (`req.body`), los formatea,
 * inyecta valores automáticos (estado activo, fecha actual e `id_escuela` del usuario autenticado)
 * y delega la creación al servicio correspondiente para luego responder al cliente.
 *
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.body - Datos recibidos: `cantidad_clases`, `cantidad_meses`, `monto` y `descripcion`.
 * @param {Request} req.usuario - Objeto de usuario autenticado inyectado por el middleware (contiene `id_escuela`).
 * @param {Response} res - Objeto de respuesta de Express encargado de retornar el estado HTTP y los datos.
 * @returns {Promise<Response>} Retorna una respuesta HTTP estructurada usando `enviarResponse` (éxito) o `enviarResponseError` (fallo).
 */
const altaPlanes_usuarios = async( req : Request , res : Response ) =>{

	const {  cantidad_clases , cantidad_meses , monto , descripcion} = req.body;
	//let idPlan : number = 0 ;

	const datosEntrada = {
		descripcion  	: descripcion as string,
		cantidad_clases : Number(cantidad_clases),
		cantidad_meses :  Number(cantidad_meses),
		monto          : parseFloat( monto),
		estado         : "activos", // como es alta siempre sera activos
		fecha_creacion : fechaHoy(), // funcion q diga la fecha aactual
		id_escuela     : Number(req.usuario?.id_escuela)
	};

	const crearPlanResult = await planesServicio.altaPlanes( datosEntrada );

	const config = MAPA_ALTA_PLAN[ crearPlanResult.code ] || ERROR_INTERNO_SERVIDOR;

	if ( config.status === CodigoEstadoHTTP.OK ) {
		return enviarResponse(
			res,
			config.status,
			crearPlanResult.message  || config.msg,
			crearPlanResult.data,
			undefined,
			crearPlanResult.code
		);
	}else{
		return enviarResponseError(
			res,
			config.status,
			crearPlanResult.message || config.msg,
			crearPlanResult.code
		);
	};
	
};

/**
 * Controlador para modificar los datos de un plan de usuario existente.
 * * Obtiene el identificador del plan desde los parámetros de la URL (`req.params`),
 * extrae los nuevos datos desde el cuerpo de la petición (`req.body`), formatea los tipos,
 * inyecta el `id_escuela` de la sesión y delega la actualización al servicio de planes.
 *
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.params - Contiene el `id_plan` extraído de la ruta.
 * @param {Request} req.body - Contiene la `descripcion`, `cantidad_clases`, `cantidad_meses` y `monto` a modificar.
 * @param {Request} req.usuario - Objeto de usuario autenticado (se extrae `id_escuela`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado.
 * @returns {Promise<Response>} Respuesta HTTP estructurada con `enviarResponse` o `enviarResponseError`.
 */
const modPlanes_usuarios = async( req : Request , res : Response ) =>{

	const { id_plan  } = req.params;
	const { descripcion , cantidad_clases, cantidad_meses,  monto } = req.body;

	const dataPlan = {
		id_plan : Number(id_plan),
		id_escuela : Number(req.usuario?.id_escuela),
		nombre_personalizado : descripcion,
		fecha_creacion : fechaHoy(), // colocar funcion fecha hoy
		cantidad_clases :Number(cantidad_clases),
		cantidad_meses  : Number(cantidad_meses),
		monto  : Number(monto)
	}


	const modResult = await planesServicio.modPlanesUsuarios( dataPlan);
	
	const config = MAPA_MOD_PLAN[ modResult.code ] || ERROR_INTERNO_SERVIDOR;

	if ( config.status === CodigoEstadoHTTP.OK ){
		return enviarResponse(
			res, 
			config.status ,
			modResult.message || config.msg,
			modResult.data,
			undefined,
			modResult.code
		);
	}else{
		return enviarResponseError(
			res,
			config.status,
			modResult.message || config.msg,
			modResult.code 
		);
	};

};

/**
 * Controlador para cambiar el estado (activar/desactivar) de un plan de usuario.
 * * Extrae el identificador del plan y el nuevo estado desde los parámetros de la URL (`req.params`),
 * estructura los datos junto con el `id_escuela` obtenido de la sesión y delega la actualización
 * al servicio de planes para retornar la respuesta correspondiente.
 *
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.params - Contiene el `id_plan` y el nuevo `estado` a aplicar.
 * @param {Request} req.usuario - Objeto de usuario autenticado (se extrae `id_escuela`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado.
 * @returns {Promise<Response>} Respuesta HTTP estructurada con `enviarResponse` o `enviarResponseError`.
 */
const estadoPlanes_usuarios = async( req : Request , res : Response ) =>{
	const { id_plan, estado} = req.params;


	const dataEstado = {
		id_plan : Number(id_plan),
		id_escuela : Number(req.usuario?.id_escuela),
		estado		
	};

	const estadoResult = await planesServicio.estadoPlan( dataEstado );

	const config = MAPA_ESTADO_PLAN[ estadoResult.code ] || ERROR_INTERNO_SERVIDOR;

	if ( config.status === CodigoEstadoHTTP.OK) {
		return enviarResponse(
			res, 
			config.status ,
			estadoResult.message || config.msg,
			estadoResult.data,
			undefined,
			estadoResult.code
		);
	}else{
		return enviarResponseError(
			res, 
			config.status,
			estadoResult.message || config.msg,
			estadoResult.code
		);
	};	

};


/**
 * Controlador para obtener el listado paginado y filtrado de los planes de usuarios.
 * * Extrae los criterios de búsqueda, paginación y escuela desde los query params (`req.query`).
 * Calcula dinámicamente el `offset` para la consulta en la base de datos, estructura el objeto
 * de búsqueda y delega la obtención al servicio correspondiente para retornar los registros y metadatos.
 *
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.query - Parámetros de consulta: `descripcion`, `estado`, `limit`, `pagina` y `escuela`.
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado.
 * @returns {Promise<Response>} Respuesta HTTP estructurada con `enviarResponse` (incluyendo paginación) o `enviarResponseError`.
 */
const listadoPlanesUsuarios = async( req : Request , res : Response ) =>{
	const {descripcion , estado ,limit , pagina, escuela} = req.query;
    
	// Calcular el offset para la consulta SQL, necesario para la paginación.
	const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
	const dataListado = {
		descripcion : String(descripcion) ,
		estado : String(estado) as 'activos' | 'inactivos' | 'todos',
		limite : Number(limit),
		offset : Number(offset),
		id_escuela : Number(escuela),
		pagina 	
	};

	const resultadoLista = await planesServicio.listadoPlanes( dataListado );

	const config = MAPA_LISTADO_PLAN[ resultadoLista.code ] || ERROR_INTERNO_SERVIDOR;

	if ( config.status === CodigoEstadoHTTP.OK){

		return  enviarResponse(
			res, 
			config.status,
			resultadoLista.message || config.msg,
			resultadoLista.data,
			resultadoLista.paginacion,
			resultadoLista.code
		);
	}else {
		return enviarResponseError(
			res,
			config.status,
			resultadoLista.message || config.msg,
			resultadoLista.code
		);
	};

};

/**
 * Controlador para obtener el listado completo de planes de usuarios sin paginación.
 * * Extrae los criterios de filtrado (`descripcion` y `estado`) desde los query params,
 * inyecta de forma segura el `id_escuela` obtenido de la sesión del usuario autenticado
 * y delega la consulta al servicio para retornar el array completo de registros.
 *
 * @param {Request} req - Objeto de petición de Express.
 * @param {Request} req.query - Parámetros de consulta opcionales: `descripcion` y `estado`.
 * @param {Request} req.usuario - Objeto de usuario autenticado (se extrae `id_escuela`).
 * @param {Response} res - Objeto de respuesta de Express para enviar el resultado.
 * @returns {Promise<Response>} Respuesta HTTP estructurada con `enviarResponse` (con data limpia) o `enviarResponseError`.
 */
const listadoPlanesSinPag = async( req : Request , res : Response ) =>{
	const { descripcion , estado } = req.query;

	const parametrosUrl = {
		descripcion , estado , id_escuela : Number(req.usuario?.id_escuela)
	};

	const listadoResult = await planesServicio.listadoPlanesSinPag( parametrosUrl );

	const config = MAPA_LISTADO_PLAN[ listadoResult.code ] || ERROR_INTERNO_SERVIDOR;

	if ( config.status === CodigoEstadoHTTP.OK) {
		return enviarResponse(
			res, 
			config.status,
			listadoResult.message || config.msg,
			listadoResult.data,
			undefined,
			listadoResult.code
		);
	}else{
		return enviarResponseError(
			res, 
			config.status,
			listadoResult.message || config.msg,
			listadoResult.code		
		);
	};

};

// Objeto que exporta los métodos del controlador envueltos en la utilidad tryCatch
export const method = {
	altaPlanes_usuarios 	 : tryCatch(altaPlanes_usuarios),
	modPlanes_usuarios 	 	 : tryCatch(modPlanes_usuarios),
	estadoPlanes_usuarios 	 : tryCatch(estadoPlanes_usuarios),
	listadoPlanesUsuarios 	 : tryCatch(listadoPlanesUsuarios),
	listadoSinPag            : tryCatch( listadoPlanesSinPag)
}