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

// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
import { method as planesUsuarios } from "../data/planes.usuarios.data";

// Seccion de Typados de Esquemas (Inputs) - Necesarios para la validación
import {CrearPlanesPagoSchema, PlanesPagoInputs,
		CrearPlanesEscuelasSchema, PlanesEscuelasInputs,
		ExistenciaPlanSchema , ExistenciaPlanesInputs,
		ModPlanesUsuarios , ModPlanesUsuariosInputs,
		estadoPlanesUsuariosInputs, EstadoPlanesUsuariosSchema,
		ListaPlanesUsuariosSchema, ListaPlanesUsuariosInputs
	} from "../squemas/planes.usuarios";

// Seccion de Typados de Resultados y Códigos
import { ResultBusquedaPlanes } from "../tipados/planes.usuarios";
import { CrearPlanesUsuarios } from "../tipados/planes.usuarios";
import { PlanServioCode } from "../tipados/planes.usuarios";
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * @description Manejador para dar de alta un nuevo plan de pago y asignarlo a una escuela.
 * @summary Realiza un proceso de dos pasos:
 * 1. Verifica la existencia del plan maestro (global) por descripción. Si no existe, lo crea.
 * 2. Verifica la existencia de la relación Plan-Escuela. Si ya existe, retorna CONFLICTO (409).
 * 3. Si la relación no existe, la crea y retorna CREADO (201).
 * @param req Request de Express, esperando body con detalles del plan.
 * @param res Response de Express.
 */
const altaPlanes_usuarios = async( req : Request , res : Response ) =>{
	
	const { id_escuela ,  cantidad_clases , cantidad_meses , monto , descripcion} = req.body;
	let idPlan : number = 0 ;

	const datosEntrada = {
		descripcion  	: descripcion as string,
		cantidad_clases : Number(cantidad_clases),
		cantidad_meses :  Number(cantidad_meses),
		monto          : parseFloat( monto),
		estado         : "activos", // como es alta siempre sera activos
		fecha_creacion : "2025-09-10", // colocar funcion q diga la fecha aactual
		id_escuela     : Number(id_escuela)
	}
	
	
	// Validar los inputs necesarios para verificar si el plan maestro existe
	const verificarPlan : ExistenciaPlanesInputs = ExistenciaPlanSchema.parse(datosEntrada);

	// 1. Verificación y Creación del Plan Maestro Global (Tabla planes_pago)
	const planGlobal = await planesUsuarios.existenciaPlan( verificarPlan.descripcion );
    /*
     * Lógica para reutilizar o crear el plan maestro:
     * El plan maestro se verifica por su 'descripcion'. Si existe, se reutiliza su ID;
     * de lo contrario, se crea una nueva entrada en la tabla 'planes_pago'.
     */
	if ( planGlobal.error === true && planGlobal.data ) {
		// El plan maestro existe, se extrae el ID
		const planExistente = planGlobal.data as ResultBusquedaPlanes ;
		idPlan = planExistente.id_plan ;

	}else if (planGlobal.error === false){
		// Si no existe, se crea el plan maestro
		const planNuevo : PlanesPagoInputs = CrearPlanesPagoSchema.parse(datosEntrada);
		const altaPlan = await planesUsuarios.altaPlanes_usuariosData( planNuevo );

		if ( altaPlan.error === false && altaPlan.data && altaPlan.code === PlanServioCode.PLAN_CREATED ) {
			const planCreado = altaPlan.data as CrearPlanesUsuarios ;
			idPlan 	= planCreado.id as number ;
		} else {
            // Manejo de error si el plan maestro no pudo ser creado
            return enviarResponse(
                res,
                CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                altaPlan.message || 'Error al crear el plan maestro.',
                null,
                undefined, 
                PlanServioCode.CREATION_FAILED
            );
        }
	}; 

	// 2. Verificación de la relación Plan-Escuela (Tabla planes_en_escuela)
	// A esta altura, 'idPlan' ya está disponible. Se verifica si la asignación ya existe.
	const planEscuelaExistente = await planesUsuarios.existenciaPlanEscuela( id_escuela , idPlan );

	if ( planEscuelaExistente.error === true && planEscuelaExistente.code === PlanServioCode.PLAN_ESCHOOL_ALREADY_EXISTS ) {
        // La relación ya existe, retornar conflicto (409) para evitar duplicados.
		return enviarResponse(
			res,
			CodigoEstadoHTTP.CONFLICTO,
			planEscuelaExistente.message,
			planEscuelaExistente.data,
			undefined,
			planEscuelaExistente.code,
		)
	}
    
	// 3. Creación de la relación Plan-Escuela (Si no existe)
    // Se mapean los inputs para la creación de la asignación con el idPlan obtenido.

	const  datosPlanEscuela = {
		...datosEntrada,
		id_plan : idPlan
	}

	const planEscuela : PlanesEscuelasInputs = CrearPlanesEscuelasSchema.parse( datosPlanEscuela );
	const altaPlanEscuela = await planesUsuarios.altaPlanesEscuelas( planEscuela );

    // 4. Retorno de éxito
	if ( altaPlanEscuela.error === false && altaPlanEscuela.data && altaPlanEscuela.code === PlanServioCode.PLAN_ESCHOOL_CREATED ) {

		return enviarResponse(
			res,
			CodigoEstadoHTTP.CREADO, // 201 Created
			altaPlanEscuela.message,
			altaPlanEscuela.data,
			undefined,
			altaPlanEscuela.code,
		) 	
	}
    // Si la relación falló por otra razón, tryCatch se encarga del error.
};

/**
 * @description Modifica los atributos de un plan específico ya asociado a una escuela.
 * @param req Request de Express, con id_plan e id_escuela en params y datos de modificación en body.
 * @param res Response de Express.
 */
const modPlanes_usuarios = async( req : Request , res : Response ) =>{
	const { id_plan , id_escuela } = req.params;
	const { descripcion , cantidad_clases, cantidad_meses,  monto } = req.body;

	const dataPlan = {
		id_plan : Number(id_plan),
		id_escuela : Number(id_escuela),
		nombre_personalizado : descripcion,
		fecha_creacion : "2025-05-10",
		cantidad_clases :Number(cantidad_clases),
		cantidad_meses  : Number(cantidad_meses),
		monto  : monto 
	}


	// Se parsean los parámetros de la URL y el body, convirtiendo IDs de string a number
	const modInputs : ModPlanesUsuariosInputs = ModPlanesUsuarios.parse( dataPlan );

	const resultado = await planesUsuarios.modPlanesUsuarios( modInputs );
    
	if ( resultado.error === false && resultado.data && resultado.code === PlanServioCode.USER_PLAN_UPDATE) {
		return enviarResponse(
			res,
			CodigoEstadoHTTP.OK, // 200 OK
			resultado.message,
			resultado.data,
			undefined,
			resultado.code,
		) 	
	}
};

/**
 * @description Cambia el estado (activo/inactivo) de un plan asociado a una escuela.
 * @param req Request de Express, con id_plan, id_escuela y el nuevo estado en params.
 * @param res Response de Express.
 */
const estadoPlanes_usuarios = async( req : Request , res : Response ) =>{
	const { id_plan , id_escuela , estado} = req.params;

	// Validar y tipar los inputs
	const estadoInputs : estadoPlanesUsuariosInputs = EstadoPlanesUsuariosSchema.parse({
		id_plan : Number(id_plan),
		id_escuela : Number(id_escuela),
		estado
	});

	const resultado = await planesUsuarios.estadoPlanes_usuarios( estadoInputs );
    
	if ( resultado.error === false && resultado.data ) {
		return enviarResponse(
			res,
			CodigoEstadoHTTP.OK, // 200 OK
			resultado.message,
			resultado.data,
			undefined,
			resultado.code,
		);
	};
};


/**
 * @description Obtiene un listado paginado de planes de una escuela, aplicando filtros.
 * @param req Request de Express, con query parameters (descripcion, estado, limit, pagina, escuela).
 * @param res Response de Express.
 */
const listadoPlanesUsuarios = async( req : Request , res : Response ) =>{
	const {descripcion , estado ,limit , pagina, escuela} = req.query;
    
	// Calcular el offset para la consulta SQL, necesario para la paginación.
	const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
	// Validar y tipar los inputs de consulta
	const listaInputs : ListaPlanesUsuariosInputs = ListaPlanesUsuariosSchema.parse({
		descripcion : String(descripcion) ,
		estado : String(estado) as 'activos' | 'inactivos' | 'todos',
		limite : Number(limit),
		offset : Number(offset),
		id_escuela : Number(escuela)
	}); 

	// Ejecutar la consulta y obtener el resultado (datos y paginación)
	const resultado = await planesUsuarios.listadoPlanesUsuarios( listaInputs , Number(pagina) );
    
    // Retornar la respuesta con el listado y la información de paginación
	enviarResponse(
		res,
		CodigoEstadoHTTP.OK, // 200 OK
		resultado.message, 	
		resultado.data,
		resultado.paginacion, // Incluye metadatos de paginación
		resultado.code,
	);

};

// Objeto que exporta los métodos del controlador envueltos en la utilidad tryCatch
export const method = {
	altaPlanes_usuarios 	 : tryCatch(altaPlanes_usuarios),
	modPlanes_usuarios 	 	 : tryCatch(modPlanes_usuarios),
	estadoPlanes_usuarios 	 : tryCatch(estadoPlanes_usuarios),
	listadoPlanesUsuarios 	 : tryCatch(listadoPlanesUsuarios)
}