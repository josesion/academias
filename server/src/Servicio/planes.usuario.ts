import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as planesUsuarios } from "../data/planes.usuarios.data";
import { registroHistorial } from "../utils/postHistorial";

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
import { type HistorialInputs } from "../squemas/historial"; 


/**
 * Servicio encargado de gestionar el alta de un plan de pago (creándolo a nivel global si no existe
 * y asociándolo a una escuela específica), validando la información con Zod, verificando relaciones previas,
 * registrando el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CrearPlanesPagoSchema`.
 * 2. Verifica si el plan ya existe a nivel global por su descripción (`planesUsuarios.existenciaPlan`). Si no existe (`PLAN_NO_EXISTE`), lo crea mediante `planesUsuarios.altaPlanes_usuariosData` para obtener su ID.
 * 3. Comprueba que se cuente con un ID de plan válido.
 * 4. Verifica si la relación entre el plan y la escuela ya existe (`planesUsuarios.existenciaPlanEscuela`).
 * 5. Si no existe (`PLANESCUELA_NO_EXISTE`), procede a crear la asignación mediante `planesUsuarios.altaPlanesEscuelas`.
 * 6. Si la asignación es exitosa (`PLANESCUELA_CREAR`), construye y registra un evento de auditoría con la acción "CREAR" en el módulo "PLANES" utilizando `registroHistorial`.
 * 7. Si la relación ya existía (`PLAN_ESCUELA_EXISTE`), retorna un error específico indicando que la asignación ya se encuentra registrada.
 * 8. Retorna la respuesta de éxito o los distintos códigos de error según las validaciones o fallos en el servidor.
 *
 * @async
 * @function altaPlanes
 * @param {Object} plan - Objeto con los datos necesarios para dar de alta el plan 
 * (incluyendo descripción, cantidad de clases, cantidad de meses, monto, fecha de creación, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `CrearPlanesPagoSchema`.
 * 
 * @example
 * const resultado = await altaPlanes({
 *    descripcion: "Plan Mensual Estándar",
 *    cantidad_clases: 8,
 *    cantidad_meses: 1,
 *    monto: 12000,
 *    fecha_creacion: "2026-07-24",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
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
            fecha_creacion :verificarPlan.fecha_creacion,
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

            const dataHistorial  : HistorialInputs = {
                id_escuela :  verificarPlan.id_escuela ,
                id_usuario :  verificarPlan.id_usuario,
                modulo : "PLANES",
                accion : "CREAR",
                id_registro: Number(altaPlanEscuela.data?.id_plan),
                descripcion: `Registro Categoria caja : ${verificarPlan.descripcion}`,
                datos: {
                    id_plan : altaPlanEscuela.data?.id,
                    nombre_plan : verificarPlan.descripcion,
                    clases : verificarPlan.cantidad_clases,
                    meses : verificarPlan.cantidad_meses,
                    monto : verificarPlan.monto,
                    fecha : verificarPlan.fecha_creacion
                } 
            }; 
            
            await registroHistorial( dataHistorial);  

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
 * Servicio encargado de gestionar la modificación de los datos de un plan de usuario existente,
 * validando la información con Zod, ejecutando la actualización en la base de datos, registrando
 * el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModPlanesUsuarios`.
 * 2. Ejecuta la actualización de los datos del plan en la capa de datos (`planesUsuarios.modPlanesUsuarios`).
 * 3. Si la modificación es exitosa (`PLANUSUARIO_MODIFICAR`), construye y registra un evento de auditoría con la acción "MODIFICAR" en el módulo "PLANES" utilizando `registroHistorial`.
 * 4. Retorna la respuesta de éxito correspondiente o un error de servidor en caso de fallar la operación.
 *
 * @async
 * @function modPlanesUsuarios
 * @param {Object} mod - Objeto con los datos necesarios para modificar el plan 
 * (incluyendo ID del plan, nombre personalizado, cantidad de clases, cantidad de meses, monto, fecha de creación, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `ModPlanesUsuarios`.
 * 
 * @example
 * const resultado = await modPlanesUsuarios({
 *    id_plan: 3,
 *    nombre_personalizado: "Plan Mensual Promo",
 *    cantidad_clases: 12,
 *    cantidad_meses: 1,
 *    monto: 15000,
 *    fecha_creacion: "2026-07-24",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const modPlanesUsuarios = async ( mod :  ModPlanesUsuariosInputs) 
: Promise<TipadoData<ModPlanesUsuariosResult>> => {

    const modPlan :  ModPlanesUsuariosInputs = ModPlanesUsuarios.parse(mod);

    const modResult = await planesUsuarios.modPlanesUsuarios( modPlan );

    if ( modResult.code === 'PLANUSUARIO_MODIFICAR' ){

         const dataHistorial  : HistorialInputs = {
            id_escuela :  modPlan.id_escuela ,
            id_usuario :  modPlan.id_usuario,
            modulo : "PLANES",
            accion : "MODIFICAR",
            id_registro: Number(modPlan.id_plan),
            descripcion: `Modificacion del plan  : ${modPlan.nombre_personalizado}`,
            datos: {
                id_plan : modPlan.id_plan,
                nombre_plan :  modPlan.nombre_personalizado,
                clases : modPlan.cantidad_clases,
                meses :  modPlan.cantidad_meses,
                monto :  modPlan.monto,
                fecha :  modPlan.fecha_creacion
            } 
        }; 

        await registroHistorial( dataHistorial); 

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
 * Servicio encargado de gestionar el cambio de estado (activar/inactivar) de un plan de usuario,
 * validando los datos con Zod, ejecutando la actualización en la base de datos, registrando
 * el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `EstadoPlanesUsuariosSchema`.
 * 2. Ejecuta la modificación del estado del plan en la capa de datos (`planesUsuarios.estadoPlanes_usuarios`).
 * 3. Si la operación es exitosa, determina la acción de auditoría correspondiente ("RESTAURAR" si pasa a activos o "ELIMINAR" si pasa a inactivos).
 * 4. Construye y registra un evento de auditoría en el módulo "PLANES" utilizando `registroHistorial`.
 * 5. Retorna la respuesta de éxito o un error de servidor en caso de fallar la operación.
 *
 * @async
 * @function estadoPlanes
 * @param {Object} estado - Objeto con los datos necesarios para modificar el estado del plan 
 * (incluyendo ID del plan, estado, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `EstadoPlanesUsuariosSchema`.
 * 
 * @example
 * const resultado = await estadoPlanes({
 *    id_plan: 3,
 *    estado: "activos",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const estadoPlanes = async ( estado : estadoPlanesUsuariosInputs  ) 
: Promise<TipadoData<estadoPlanesUsuarios>>=> {
    
	const estadoInputs : estadoPlanesUsuariosInputs = EstadoPlanesUsuariosSchema.parse( estado );

    const estadoResult = await planesUsuarios.estadoPlanes_usuarios(estadoInputs);

    if ( estadoResult.error === false  ){ // si la operacion de estado es es exitosa

        const estadoFinal  = estadoInputs.estado === "activos" ? "activo" : "inactivo";
        const accionFinal  = estadoInputs.estado === "activos" ? "RESTAURAR" : "ELIMINAR"

         const dataHistorial  : HistorialInputs = {
            id_escuela :  estadoInputs.id_escuela ,
            id_usuario :  estadoInputs.id_usuario,
            modulo : "PLANES",
            accion : accionFinal,
            id_registro: Number(estadoInputs.id_plan),
            descripcion: `El estado de : ${estadoInputs.id_plan} cambio a ${estadoFinal}`,
            datos: {
                id_plan : estadoInputs.id_plan,
            } 
        }; 

        await registroHistorial( dataHistorial); 

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



