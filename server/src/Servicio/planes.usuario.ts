import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as planesUsuarios } from "../data/planes.usuarios.data";


// Seccion de Typados de Esquemas (Inputs) - Necesarios para la validación
import {CrearPlanesPagoSchema, PlanesPagoInputs,
		ModPlanesUsuarios , ModPlanesUsuariosInputs,
		estadoPlanesUsuariosInputs, EstadoPlanesUsuariosSchema,
		ListaPlanesUsuariosSchema, ListaPlanesUsuariosInputs,
		ListaPlanesUsuarioSinPagInputs , ListaPlanesUsuarioSinPagSchema
	
	} from "../squemas/planes.usuarios";
import type { ResultBusquedaPlanes, ModPlanesUsuariosResult,estadoPlanesUsuarios,
    ResulListadoPlanesUsuarios
 } from "../tipados/planes.usuarios"; 
import { TipadoData } from "../tipados/tipado.data";

/**
 * Procesa el alta de un plan de pago. 
 * Verifica si el plan maestro existe a nivel global mediante su descripción para reutilizarlo o crearlo,
 * y posteriormente gestiona la asignación del plan a una escuela específica evitando duplicados.
 * * @async
 * @function altaPlanes
 * @param {PlanesPagoInputs} plan - Objeto con los datos del plan y el ID de la escuela asociado.
 * @returns {Promise<TipadoData<any>>} Respuesta unificada indicando el éxito o el código de error específico del flujo.
 * @throws {ZodError} Si los datos de entrada no cumplen con las reglas estructurales de `CrearPlanesPagoSchema`.
 */
const altaPlanes = async( plan : PlanesPagoInputs ) 
: Promise<TipadoData<ResultBusquedaPlanes>>=>{

    const verificarPlan : PlanesPagoInputs = CrearPlanesPagoSchema.parse( plan ); // Validamos la estructura y tipos del plan recibido
	// Verificación y Creación del Plan Maestro Global (Tabla planes_pago)
    const planGlobal = await planesUsuarios.existenciaPlan( verificarPlan.descripcion ); 

    let idPlan : number = 0 ;
    
    if ( planGlobal.code === "PLAN_NO_EXISTE" ) {
        // creamos el plan globalmente por primera vez
        const altaPlan = await planesUsuarios.altaPlanes_usuariosData( verificarPlan );
        
        if ( altaPlan.error === true) {
            return {
                error : true,
                message : "Error al crear el plan maestro",
                code : "ERROR_ALTA_PLAN_MAESTRO"
            };
        };

        idPlan = altaPlan.data?.id || 0; // obtenemos el id del plan creado
    }else {
        idPlan = planGlobal.data?.id || 0; // obtenemos el id del plan existente
    };


    if ( !idPlan || idPlan === 0 ) { 
        return{
            error : true, 
            message : "Error al obtener el ID del plan maestro",
            code : "ERROR_ID_PLAN_MAESTRO"
        }
    };


    //  Verificación de la relación Plan-Escuela (Tabla planes_en_escuela)
	// A esta altura, 'idPlan' ya está disponible. Se verifica si la asignación ya existe.
	const planEscuelaExistente = await planesUsuarios.existenciaPlanEscuela( verificarPlan.id_escuela , idPlan );

    if ( planEscuelaExistente.code === "PLANESCUELA_NO_EXISTE" ){

        const nuevoPlanEscuela = {
            ...verificarPlan, 
            id_plan : idPlan,
            fecha_creacion : "2025-09-10",
        };

        // Si no existe la relación, se crea una nueva asignación del plan a la escuela.
        const altaPlanEscuela = await planesUsuarios.altaPlanesEscuelas( nuevoPlanEscuela );
   
        // SI hubo un error al crear la asignación del plan a la escuela, se retorna un mensaje de error específico.
        if ( altaPlanEscuela.error === true ) {
             return {
                error : true,
                message : "Error al asignar el plan a la escuela",
                code : "ERROR_ALTA_PLAN_ESCUELA"
             };
        };

       // Si la asignación del plan a la escuela se creó exitosamente, se retorna un mensaje de éxito específico.  
        if ( altaPlanEscuela.code === "PLANESCUELA_CREAR"){
            return{
                error : false, 
                message : "Plan creado y asignado a la escuela exitosamente",
                code : "PLAN_ESCUELA_OK"
            };
        };
    };    

    // Si la relación Plan-Escuela ya existe, se retorna un mensaje de error específico.
    if ( planEscuelaExistente.code === "PLAN_ESCUELA_EXISTE" ) {
        return {
            error : true, 
            message : "La asignación del plan a la escuela ya existe",
            code : "PLAN_EXISTENTE_PLAN_ESCUELA"
        };
    };
    

    return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
   };           
};
    

/**
 * Modifica el plan de un usuario en el sistema.
 * * Valida los datos de entrada mediante el esquema de Zod, realiza la actualización
 * en la base de datos y retorna una estructura estandarizada con el resultado de la operación.
 *
 * @param {ModPlanesUsuariosInputs} mod - Objeto con los datos necesarios para modificar el plan.
 * @returns {Promise<TipadoData<ModPlanesUsuariosResult>>} Promesa que resuelve a un objeto TipadoData:
 * - Éxito (`PLAN_MODIFICACION_OK`): Si el código del resultado coincide con la modificación correcta.
 * - Error (`ERROR_SERVIDOR`): Si ocurre un problema o el código no es el esperado.
 */
const modPlanesUsuarios = async ( mod :  ModPlanesUsuariosInputs) 
: Promise<TipadoData<ModPlanesUsuariosResult>> => {

    const modPlan :  ModPlanesUsuariosInputs = ModPlanesUsuarios.parse(mod);

    const modResult = await planesUsuarios.modPlanesUsuarios( modPlan );

    if ( modResult.code === 'PLANUSUARIO_MODIFICAR' ){
        return {
            error : false, 
            message : "Se modifico Correctamente",
            code : "PLAN_MODIFICACION_OK"
        };
    };

    return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
    };    

};    

/**
 * Modifica el estado del plan de un usuario.
 * * Valida los parámetros de entrada con Zod, ejecuta la actualización del estado
 * en la base de datos y retorna una estructura estandarizada con el resultado.
 *
 * @param {estadoPlanesUsuariosInputs} estado - Objeto con los datos para actualizar el estado del plan.
 * @returns {Promise<TipadoData<estadoPlanesUsuarios>>} Promesa que resuelve a un objeto TipadoData:
 * - Éxito (`ESTADO_PLAN_MODIFICACION_OK`): Si `estadoResult.error` es false.
 * - Error (`ERROR_SERVIDOR`): Si la operación falla o el servidor devuelve un error.
 */
const estadoPlanes = async ( estado : estadoPlanesUsuariosInputs  ) 
: Promise<TipadoData<estadoPlanesUsuarios>>=> {
    
	const estadoInputs : estadoPlanesUsuariosInputs = EstadoPlanesUsuariosSchema.parse( estado );

    const estadoResult = await planesUsuarios.estadoPlanes_usuarios(estadoInputs);

    if ( estadoResult.error === false  ){ // si la operacion de estado es es exitosa
        return {
            error : false, 
            message : "Se modifico el estado Correctamente",
            code : "ESTADO_PLAN_MODIFICACION_OK"
        };
    };

 
    return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
    };       

};

/**
 * Obtiene el listado paginado de los planes de usuarios.
 * * Valida los parámetros de búsqueda con Zod, parsea el número de página,
 * consulta la base de datos y retorna los registros junto con la información de paginación.
 *
 * @param {ListaPlanesUsuariosInputs} planes - Objeto con los filtros y el número de página para el listado.
 * @returns {Promise<TipadoData<ResulListadoPlanesUsuarios[]>>} Promesa que devuelve un objeto TipadoData:
 * - Éxito (`PLANES_LISTADO_OK`): Retorna el array de planes en `data` y los metadatos en `paginacion`.
 * - Error (`ERROR_SERVIDOR`): Si ocurre un problema en el servidor o el código no coincide.
 */
const listadoPlanes = async ( planes : ListaPlanesUsuariosInputs) 
: Promise<TipadoData<ResulListadoPlanesUsuarios[]>> => {
 
	const dataListado : ListaPlanesUsuariosInputs = ListaPlanesUsuariosSchema.parse( planes );

    	const planesListado = await planesUsuarios.listadoPlanesUsuarios(  dataListado , Number(dataListado.pagina) );

        if ( planesListado.code === 'PLANUSUARIO_LISTED'){
            return {
                error : false, 
                message : "Listado obtenido correctamente",
                data : planesListado.data,
                code : "PLANES_LISTADO_OK",
                paginacion : planesListado.paginacion
            };
        };

    return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
    };       
    
};

/**
 * Obtiene el listado completo de los planes de usuarios sin aplicar paginación.
 * * Valida los datos o filtros de entrada mediante Zod, realiza la consulta a la base
 * de datos y retorna todos los registros encontrados en un array limpio.
 *
 * @param {ListaPlanesUsuarioSinPagInputs} data - Objeto con los filtros necesarios para la búsqueda.
 * @returns {Promise<TipadoData<ResulListadoPlanesUsuarios[]>>} Promesa que devuelve un objeto TipadoData:
 * - Éxito (`PLANES_LISTADO_OK`): Retorna el array completo con los planes en la propiedad `data`.
 * - Error (`ERROR_SERVIDOR`): Si la base de datos falla o el código devuelto no es el esperado.
 */
const listadoPlanesSinPag = async ( data : ListaPlanesUsuarioSinPagInputs ) 
: Promise<TipadoData<ResulListadoPlanesUsuarios[]>>=> {

    const dataList : ListaPlanesUsuarioSinPagInputs = ListaPlanesUsuarioSinPagSchema.parse( data );
    
    const listadoPlanesResult = await planesUsuarios.listadoPlanesSinPag( dataList);

    if ( listadoPlanesResult.code ===  'PLANUSUARIO_LISTED') {
        return {
            error : false,
            message : "Listado obtenido correctamente",
            data : listadoPlanesResult.data,
            code : "PLANES_LISTADO_OK"
        };
    };

    return{
        error : true, 
        message : "Error en el servidor , intentar nuevamente.",
        code : "ERROR_SERVIDOR"
    };     

};

export const method = {
    altaPlanes : tryCatchDatos( altaPlanes ),
    modPlanesUsuarios : tryCatchDatos(modPlanesUsuarios),
    estadoPlan : tryCatchDatos( estadoPlanes),
    listadoPlanes : tryCatchDatos( listadoPlanes ),
    listadoPlanesSinPag : tryCatchDatos( listadoPlanesSinPag)
};



