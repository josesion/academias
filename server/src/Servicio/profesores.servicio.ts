import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataProfesores } from "../data/profesores.data";
import { registroHistorial } from "../utils/postHistorial";

import { TipadoData } from "../tipados/tipado.data";
import { CrearProfesorSchema , ModProfesoresSchema, EstadoProfesorSchema, ListaProfeUsuariosSchema,
         ProfesorInputs ,  ModProfesorInputs , EstadoProfesorInputs,
         ListadoProfeInputs , ListaProfeUsuarioSinPagSchema, ListadoProfeSinPagInputs
} from "../squemas/profesores"; 

import { ProfesoresGlobales , FiltroProfeEscuelaBaja, ResulListadoProfesoresUsuarios, ListadoProfeResults } from "../tipados/profesores.data";
import { type HistorialInputs } from "../squemas/historial";


/**
 * Servicio encargado de gestionar el alta de un profesor (tanto a nivel global del sistema como asociado a una escuela específica),
 * validando los datos con Zod, verificando si ya existe previamente, registrando la acción en el historial de auditoría
 * y retornando la respuesta estructurada correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CrearProfesorSchema`.
 * 2. Verifica si el profesor ya existe globalmente en el sistema (`dataProfesores.verProfesor`). Si no existe (`PROFESOR_NO_EXISTE`), procede a crearlo globalmente (`dataProfesores.altaProfesores`).
 * 3. Comprueba si el profesor ya se encuentra asociado a la escuela (`dataProfesores.verProfesorEscuela`).
 * 4. Si ya existe en la escuela (`PROFESORESCUELA_EXISTE`), retorna un error indicando que el profesor ya está registrado allí.
 * 5. Si no existe en la escuela (`PROFESORESCUELA_NO_EXISTE`), realiza la vinculación mediante `dataProfesores.altaProfesoresEscuela`.
 * 6. Si la vinculación es exitosa (`PROFESORESCUELA_ALTA`), construye y registra un evento de auditoría con la acción "CREAR" en el módulo "PROFESORES".
 * 7. Retorna la respuesta de éxito o los distintos códigos de error según las validaciones o fallos en el servidor.
 *
 * @async
 * @function altaProfesor
 * @param {Object} profe - Objeto con los datos necesarios para dar de alta al profesor 
 * (incluyendo DNI, nombre, apellido, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, datos del DNI registrado y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `CrearProfesorSchema`.
 * 
 * @example
 * const resultado = await altaProfesor({
 *    dni: "35123456",
 *    nombre: "Juan",
 *    apellido: "Pérez",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const altaProfesor = async ( profe : ProfesorInputs )
: Promise<TipadoData<{ dni : string}>> =>  {

    const dataProfe : ProfesorInputs = CrearProfesorSchema.parse( profe );
    
    // Verifico si ya se encuentra inscripcio de forma global    
    const existeProfeGlobal = await dataProfesores.verProfesor(dataProfe.dni);
    
    if ( existeProfeGlobal.code === "PROFESOR_NO_EXISTE" ){
         // si no existe lo creamos 
        const crearProfesorGlobal = await dataProfesores.altaProfesores( dataProfe );

        if ( crearProfesorGlobal.error === true) {
            return {
                error : true,
                message : "Error en alta Profesor maestro",
                code : "ERROR_ALTA_PROFESPOR_MAESTRO"
            };
        };
    };

   const existeProfesorEscuela = await dataProfesores.verProfesorEscuela({ dni : dataProfe.dni , id_escuela : dataProfe.id_escuela});   
   
   if ( existeProfesorEscuela.code === "PROFESORESCUELA_EXISTE") {
      return {
            error : true, 
            message : "El profesor ya se encuentra en la escuela",
            code : "PROFESOR_EXISTE"
      };
   };

    if ( existeProfesorEscuela.code === "PROFESORESCUELA_NO_EXISTE") {

        const crearProfesorEscuela = await dataProfesores.altaProfesoresEscuela( dataProfe );
        
        if ( crearProfesorEscuela.code === "PROFESORESCUELA_ALTA" ) {

        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataProfe.id_escuela ,
            id_usuario :  dataProfe.id_usuario,
            modulo : "PROFESORES",
            accion : "CREAR",
            id_registro: Number(dataProfe.dni),
            descripcion: `Registro Profesor : ${dataProfe.apellido } ${dataProfe.nombre}`,
            datos: {
                dni : dataProfe.dni,
                apellido : dataProfe.apellido,
                nombre   : dataProfe.nombre,
            }
        }; 
                
        await registroHistorial( dataHistorial); 

            return{
                error : false, 
                message : "Se creo anoto correctamente",
                data : crearProfesorEscuela.data,
                code : "ALTA_PROFE_OK"
            };
        };

    };

    return {
        error : true,
        message : "Error en el serivodor, Profesores",
        code : "ERROR_SERVIDOR"
    };

};


/**
 * Servicio encargado de gestionar la modificación de los datos de un profesor existente,
 * validando la información con Zod, ejecutando la actualización en la base de datos, registrando
 * el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModProfesoresSchema`.
 * 2. Ejecuta la actualización de los datos del profesor en la capa de datos (`dataProfesores.modProfesores`).
 * 3. Si la modificación es exitosa (`PROFESORESCUELA_MODIFICAR`), construye y registra un evento de auditoría con la acción "MODIFICAR" en el módulo "PROFESORES".
 * 4. Retorna la respuesta de éxito correspondiente o un error de servidor en caso de fallar la operación.
 *
 * @async
 * @function modProfesor
 * @param {Object} inputDatos - Objeto con los datos necesarios para modificar al profesor 
 * (incluyendo DNI, nombre, apellido, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, datos actualizados y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `ModProfesoresSchema`.
 * 
 * @example
 * const resultado = await modProfesor({
 *    dni: 35123456,
 *    nombre: "Juan",
 *    apellido: "Pérez",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const modProfesor = async (inputDatos:  ModProfesorInputs)
: Promise<TipadoData<ProfesoresGlobales>> => {

    const datosValidados:  ModProfesorInputs =  ModProfesoresSchema.parse(inputDatos);

    const resultadoMod = await dataProfesores.modProfesores( datosValidados );

    if (resultadoMod.code === "PROFESORESCUELA_MODIFICAR" ) {

        const dataHistorial  : HistorialInputs = {
            id_escuela :  datosValidados.id_escuela ,
            id_usuario :  datosValidados.id_usuario,
            modulo : "PROFESORES",
            accion : "MODIFICAR",
            id_registro: Number(datosValidados.dni),
            descripcion: `Modificaron los datos  : ${datosValidados.apellido } ${datosValidados.nombre}`,
            datos: {
                dni : datosValidados.dni,
                apellido : datosValidados.apellido,
                nombre   : datosValidados.nombre,
            }
        }; 
                
        await registroHistorial( dataHistorial);         

        return {
            error: false,
            message: "Se modificó correctamente",
            code: "MODIFICACION_PROFE_OK"
        };
    }

    return {
        error: true,
        message: "Error en la modificación del profesor",
        code: "ERROR_SERVIDOR"
    };
};


/**
 * Servicio encargado de gestionar el cambio de estado (alta o baja / activar o inactivar) de un profesor,
 * validando los datos con Zod, ejecutando la modificación en la base de datos, registrando
 * la acción correspondiente en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `EstadoProfesorSchema`.
 * 2. Ejecuta la modificación del estado del profesor en la capa de datos (`dataProfesores.estadoProfesor`).
 * 3. Si el código de resultado es `PROFESORESCUELA_ELIMINAR`, registra un evento de auditoría con la acción "RESTAURAR" en el módulo "PROFESORES".
 * 4. Si el código de resultado es `PROFESORESCUELA_ALTA`, registra un evento de auditoría con la acción "ELIMINAR" en el módulo "PROFESORES".
 * 5. Retorna la respuesta de éxito correspondiente o un error de servidor en caso de fallar la operación.
 *
 * @async
 * @function estadoProfesor
 * @param {Object} estado - Objeto con los datos necesarios para modificar el estado del profesor 
 * (incluyendo DNI, estado, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, datos del filtro de baja y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `EstadoProfesorSchema`.
 * 
 * @example
 * const resultado = await estadoProfesor({
 *    dni: 35123456,
 *    estado: "inactivo",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const estadoProfesor = async ( estado :  EstadoProfesorInputs)
: Promise<TipadoData<FiltroProfeEscuelaBaja>> => {

     const estadoProfesorData : EstadoProfesorInputs = EstadoProfesorSchema.parse( estado ); 

     const estadoResult  = await dataProfesores.estadoProfesor( estadoProfesorData); 

     if ( estadoResult.code ===  "PROFESORESCUELA_ELIMINAR" ) {

        const dataHistorial  : HistorialInputs = {
            id_escuela :  estadoProfesorData.id_escuela ,
            id_usuario :  estadoProfesorData.id_usuario,
            modulo : "PROFESORES",
            accion : "RESTAURAR",
            id_registro: Number(estadoProfesorData.dni),
            descripcion: `Estado esta activo de : ${estadoProfesorData.dni}`,
            datos: {
                dni : estadoProfesorData.dni,
            }
        }; 
                
        await registroHistorial( dataHistorial)        

        return {
            error : false,
            message : "Se elimino correctamente.",
            code : "MODIFICACION_PROFE_ELIMINAR_OK"
        };
     };

     if ( estadoResult.code ===  "PROFESORESCUELA_ALTA" ) {
        const dataHistorial  : HistorialInputs = {
            id_escuela :  estadoProfesorData.id_escuela ,
            id_usuario :  estadoProfesorData.id_usuario,
            modulo : "PROFESORES",
            accion : "ELIMINAR",
            id_registro: Number(estadoProfesorData.dni),
            descripcion: `Estado paso a incativo  de : ${estadoProfesorData.dni}`,
            datos: {
                dni : estadoProfesorData.dni,
            }
        }; 

                
        await registroHistorial( dataHistorial)           
        
        return {
            error : false,
            message : "Se dio de alta correctamente.",
            code : "MODIFICACION_PROFE_ALTA_OK"
        };
     };

     return {
        error: true,
        message: "Error en la modificación del profesor",
        code: "ERROR_SERVIDOR"
    };    

};



/**
 * Obtiene el listado paginado de profesores asignados a una escuela.
 * * El flujo de la función consiste en:
 * 1. Validar y parsear los datos de entrada con Zod (`ListaProfeUsuariosSchema`).
 * 2. Solicitar los datos a la capa de persistencia/servicio (`dataProfesores`).
 * 3. Retornar una estructura estandarizada tanto para éxito como para error.
 *
 * @param {ListadoProfeInputs} dataList - Parámetros de entrada que incluyen filtros y paginación.
 * @returns {Promise<TipadoData<ResulListadoProfesoresUsuarios[]>>} Promesa con el resultado de la operación:
 * - En caso de éxito (`LISTADO_PROFESOR_OK`): Contiene los datos de los profesores y la paginación.
 * - En caso de fallo (`ERROR_SERVIDOR`): Retorna la bandera de error y el mensaje correspondiente.
 * * @throws {ZodError} Si los datos de entrada no cumplen con la estructura de `ListaProfeUsuariosSchema`.
 */
const listadoProfesor =  async ( dataList : ListadoProfeInputs )
: Promise<TipadoData<ResulListadoProfesoresUsuarios[]>> =>  {

    const listadoParams : ListadoProfeInputs = ListaProfeUsuariosSchema.parse( dataList );
  
    const listadoResult = await dataProfesores.listadoProfesores( listadoParams , Number(listadoParams.pagina) );
   // console.log(listadoResult)
    if ( listadoResult.code === "PROFESORESCUELA_LISTED") {
        return {
            error : false,
            message : "Listado de profesores.",
            data : listadoResult.data,
            paginacion : listadoResult.paginacion,
            code : "LISTADO_PROFESOR_OK"
        };  
    };

     return {
        error: true,
        message: "Error al obtener el listado de profesores",
        code: "ERROR_SERVIDOR"
    };    

};

/**
 * Obtiene el listado completo de profesores sin aplicar paginación.
 * * El flujo de la función consiste en:
 * 1. Validar los datos de entrada con el esquema Zod `ListaProfeUsuarioSinPagSchema`.
 * 2. Consultar la base de datos o servicio a través de `dataProfesores.listaProfesoresSinPaginacion`.
 * 3. Evaluar la respuesta para retornar un objeto estandarizado según el resultado.
 *
 * @param {ListadoProfeSinPagInputs} data - Parámetros de entrada para filtrar el listado (sin incluir controles de página).
 * @returns {Promise<TipadoData<ListadoProfeResults[]>>} Promesa con el resultado de la operación:
 * - `LISTADO_PROFESORES_OK` (Éxito): Retorna los datos de los profesores encontrados.
 * - `LISTADO_PROFESORES_VACIO` (Controlado): Indica que no hay profesores activos para la escuela.
 * - `ERROR_SERVIDOR` (Fallo): Error genérico no controlado en la consulta.
 * * @throws {ZodError} Si los datos de entrada no cumplen con la estructura de `ListaProfeUsuarioSinPagSchema`.
 */
const ListadoSinPaginacion = async( data : ListadoProfeSinPagInputs  )
: Promise<TipadoData<ListadoProfeResults[]>> =>{

    const dataListado : ListadoProfeSinPagInputs = ListaProfeUsuarioSinPagSchema.parse(data);

    const listadoResult = await dataProfesores.listaProfesoresSinPaginacion( dataListado ); 
    
    if ( listadoResult.code === "PROFESORESCUELA_LISTED") {
        return {
            error : false,
            message : "Listado de profesores.",
            data  : listadoResult.data,
            code  : "LISTADO_PROFESORES_OK"
        };
    };

    if ( listadoResult.code === "NO_ACTIVE_PROFESORESCUELA") {
        return {
            error : true,
            message : "Sin listado de profesores.",
            code  : "LISTADO_PROFESORES_VACIO"
        };
    };
    
    return {
        error: true,
        message: "Error al obtener el listado de profesores",
        code: "ERROR_SERVIDOR"
    };    
};

export const method = {
    altaProfesor : tryCatchDatos( altaProfesor ),
    modProfesor  : tryCatchDatos( modProfesor),
    estadoProfesor : tryCatchDatos( estadoProfesor ),
    listadoProfesor : tryCatchDatos( listadoProfesor ),
    listadoProfesorSinPag : tryCatchDatos( ListadoSinPaginacion)
}; 
