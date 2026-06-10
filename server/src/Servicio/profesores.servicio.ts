import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataProfesores } from "../data/profesores.data";


import { TipadoData } from "../tipados/tipado.data";
import { CrearProfesorSchema , ModProfesoresSchema, EstadoProfesorSchema, ListaProfeUsuariosSchema,
         ProfesorInputs ,  ModProfesorInputs , EstadoProfesorInputs,
         ListadoProfeInputs , ListaProfeUsuarioSinPagSchema, ListadoProfeSinPagInputs
} from "../squemas/profesores"; 

import { ProfesoresGlobales , FiltroProfeEscuelaBaja, ResulListadoProfesoresUsuarios, ListadoProfeResults } from "../tipados/profesores.data";

/**
 * Registra un nuevo profesor en el sistema global (si no existe) y lo vincula a una escuela específica.
 *
 * @async
 * @function altaProfesor
 * @param {ProfesorInputs} profe - Objeto con los datos de entrada del profesor a registrar.
 * @returns {Promise<TipadoData<{ dni: string }>>} Promesa que resuelve con el resultado de la operación:
 * * **Respuestas de Éxito:**
 * - `ALTA_PROFE_OK`: El profesor fue vinculado a la escuela correctamente.
 * * **Respuestas de Error:**
 * - `ERROR_ALTA_PROFESPOR_MAESTRO`: Falló la creación del profesor en la base de datos global.
 * - `PROFESOR_EXISTE`: El profesor ya estaba vinculado a la escuela especificada.
 * - `ERROR_SERVIDOR`: Error genérico si no se cumple ninguna de las condiciones controladas.
 * * @throws {ZodError} Si los datos de entrada `profe` no cumplen con la validación de `CrearProfesorSchema`.
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
        console.log("servicio", crearProfesorEscuela)
        
        if ( crearProfesorEscuela.code === "PROFESORESCUELA_ALTA" ) {
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
 * Modifica los datos de un profesor en el sistema.
 * * Valida los datos de entrada mediante un esquema de Zod (`ModProfesoresSchema`)
 * y luego realiza la actualización en la base de datos o servicio correspondiente.
 *
 * @param {ModProfesorInputs} inputDatos - Objeto con los datos del profesor que se van a modificar.
 * @returns {Promise<TipadoData<ProfesoresGlobales>>} Promesa que resuelve con el estado de la operación:
 * - En caso de éxito (`error: false`): Confirma la modificación correcta.
 * - En caso de fallo (`error: true`): Indica un error en el servidor o en el proceso.
 * * @throws {ZodError} Si los datos de entrada no cumplen con las reglas de `ModProfesoresSchema`.
 */
const modProfesor = async (inputDatos:  ModProfesorInputs)
: Promise<TipadoData<ProfesoresGlobales>> => {

    const datosValidados:  ModProfesorInputs =  ModProfesoresSchema.parse(inputDatos);

    const resultadoMod = await dataProfesores.modProfesores( datosValidados );

    if (resultadoMod.code === "PROFESORESCUELA_MODIFICAR" ) {
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
 * Cambia el estado (Alta/Baja) de un profesor en el sistema.
 * * Valida los datos de entrada con `EstadoProfesorSchema` y procesa el cambio.
 * Dependiendo del resultado del servicio, confirma si el profesor fue dado de alta 
 * o eliminado (baja lógica).
 *
 * @param {EstadoProfesorInputs} estado - Objeto con los datos necesarios para cambiar el estado del profesor (ej. ID, nuevo estado).
 * @returns {Promise<TipadoData<FiltroProfeEscuelaBaja>>} Promesa que resuelve con el resultado de la operación:
 * - Si `code` es "MODIFICACION_PROFE_ELIMINAR_OK": Se procesó la baja correctamente.
 * - Si `code` es "MODIFICACION_PROFE_ALTA_OK": Se procesó el alta correctamente.
 * - Si `error` es `true`: Hubo un problema en el servidor.
 * * @throws {ZodError} Si el parámetro `estado` no pasa la validación del esquema `EstadoProfesorSchema`.
 */
const estadoProfesor = async ( estado :  EstadoProfesorInputs)
: Promise<TipadoData<FiltroProfeEscuelaBaja>> => {

     const estadoProfesorData : EstadoProfesorInputs = EstadoProfesorSchema.parse( estado ); 

     const estadoResult  = await dataProfesores.estadoProfesor( estadoProfesorData); 

     if ( estadoResult.code ===  "PROFESORESCUELA_ELIMINAR" ) {
        return {
            error : false,
            message : "Se elimino correctamente.",
            code : "MODIFICACION_PROFE_ELIMINAR_OK"
        };
     };

     if ( estadoResult.code ===  "PROFESORESCUELA_ALTA" ) {
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
