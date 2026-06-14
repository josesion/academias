import { tryCatchDatos } from "../utils/tryCatchBD";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as dataTipo } from "../data/tipo_clases.data";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data";
import { ResulListadoTipoUsuarios } from "../tipados/tipo.data";
import { CrearTipoSchema , CrearTipoInput , ModTipoInput , ModTipoSchema ,
         EstadoTipoInput , EstadoTipoSchema, ListaTipoUsuariosSchema, ListadoTipoInput,
         ListaTipoUsuarioSinPagSchema, ListadoTipoSinPagInput
        } from "../squemas/tipo.usuarios";


/**
 * Servicio encargado del alta de un nuevo tipo de clase para la escuela.
 * * Realiza la validación de los datos mediante el esquema `CrearTipoSchema`,
 * verifica la existencia previa del tipo en la base de datos para evitar duplicados
 * y procede con el registro si la validación es exitosa.
 *
 * @async
 * @function altaTipoClase
 * @param {CrearTipoInput} alta - Datos del nuevo tipo de clase (nombre del tipo e id_escuela).
 * @returns {Promise<TipadoData<{tipo: string}>>} Objeto de respuesta tipado:
 * - TIPO_CLASE_OK: El tipo se registró correctamente.
 * - TIPO_CLASE_EXISTE: El nombre del tipo ya se encuentra registrado para esta escuela.
 * - ERROR_SERVIDOR: Fallo inesperado en la capa de datos.
 * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */
const altaTipoClase =  async ( alta : CrearTipoInput)
: Promise<TipadoData<{tipo : string}>> => {

   const dataAlta : CrearTipoInput = CrearTipoSchema.parse( alta );
   
    const existeTipo =await dataTipo.verificar( dataAlta.tipo , dataAlta.id_escuela);
    
    if (existeTipo.code === 'TIPO_EXISTE'){
        return {
            error : true,
            message : "El Tipo de clase ya existe.",
            code : "TIPO_CLASE_EXISTE"
        };
    };

    const altaResult = await dataTipo.altaTipo(dataAlta);

     if (altaResult.code === "TIPO_CREAR"){
        return{
            error : false,
            message : "Tipo de clase agregada correctamente.",
            code : "TIPO_CLASE_OK"
        };
     };

     return{
        error : true, 
        message : "Error en el servidor, intente nuevamente mas tarde.",
        code : "ERROR_SERVIDOR"
     };

};

/**
 * Servicio encargado de la modificación de un tipo de clase existente.
 * * Realiza la validación de los datos mediante `ModTipoSchema`, verifica
 * si el nuevo nombre del tipo de clase ya se encuentra registrado para evitar
 * colisiones (exceptuando el registro actual) y aplica los cambios en la base de datos.
 *
 * @async
 * @function modTipoClase
 * @param {ModTipoInput} mod - Datos a modificar, incluyendo el ID del tipo, el nuevo nombre y el id_escuela.
 * @returns {Promise<TipadoData<{id: number, tipo: string}>>} Objeto de respuesta tipado:
 * - TIPO_CLASE_MOD_OK: Modificación realizada exitosamente.
 * - TIPO_CLASE_EXISTE: El nuevo nombre del tipo ya está en uso por otro registro.
 * - ERROR_SERVIDOR: Fallo inesperado en la capa de datos.
 * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */
const modTipoClase = async ( mod : ModTipoInput )
: Promise<TipadoData<{id: number , tipo : string}>> => {

    const dataMod :  ModTipoInput = ModTipoSchema.parse( mod );

    const existeTipo =await dataTipo.verificar( dataMod.tipo , dataMod.id_escuela);

    if (existeTipo.code === 'TIPO_EXISTE'){
        return {
            error : true,
            message : "El Tipo de clase ya existe.",
            code : "TIPO_CLASE_EXISTE"
        };
    };

    const modResult = await dataTipo.modficarTipo(dataMod);
    
    if ( modResult.code === 'TIPO_MODIFICAR' ) {
        return {
            error : false, 
            message : "El tipo de clase se modifico",
            code : "TIPO_CLASE_MOD_OK"
        };
    };

     return{
        error : true, 
        message : "Error en el servidor, intente nuevamente mas tarde.",
        code : "ERROR_SERVIDOR"
     };    
    
};


/**
 * Servicio encargado de actualizar el estado (activo/inactivo) de un tipo de clase.
 * * Valida los datos de entrada mediante `EstadoTipoSchema`, y delega 
 * la actualización a la capa de datos.
 *
 * @async
 * @function estadoTipo
 * @param {EstadoTipoInput} estado - Objeto con el ID del tipo de clase y el nuevo estado a asignar.
 * @returns {Promise<TipadoData<{id: number}>>} Objeto de respuesta tipado:
 * - TIPO_CLASE_ESTADO_OK: Cambio de estado realizado correctamente.
 * - ERROR_SERVIDOR: Fallo inesperado en la capa de datos al procesar el cambio.
 * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */
const estadoTipo = async ( estado : EstadoTipoInput) 
: Promise<TipadoData<{ id: number }>> => {

    const data : EstadoTipoInput = EstadoTipoSchema.parse( estado);

    const estadoTipo = await dataTipo.estadoTipo(data); 

    if ( estadoTipo.code === 'TIPO_MODIFICAR'){
        return {
            error : false,
            message : "El estado cambio correctamente.",
            code : "TIPO_CLASE_ESTADO_OK"
        };
    };

     return{
        error : true, 
        message : "Error en el servidor, intente nuevamente mas tarde.",
        code : "ERROR_SERVIDOR"
     };      
};


/**
 * Servicio encargado de obtener el listado paginado de tipos de clase.
 * * Valida los parámetros de entrada mediante `ListaTipoUsuariosSchema`, 
 * consulta la capa de datos aplicando los filtros y la paginación,
 * y retorna un objeto de respuesta con los datos obtenidos o el estado de error correspondiente.
 *
 * @async
 * @function listadoTipoClases
 * @param {ListadoTipoInput} listado - Objeto que contiene los filtros de búsqueda y parámetros de paginación.
 * @returns {Promise<TipadoData<ResulListadoTipoUsuarios[]>>} Objeto de respuesta tipado:
 * - TIPO_CLASE_LISTADO_OK: Se obtuvo el listado exitosamente (incluye objeto de paginación).
 * - SIN_LISTADO_TIPO_CLASE: No se encontraron registros que coincidan con los filtros.
 * - ERROR_SERVIDOR: Fallo inesperado en la capa de datos.
 * @throws {ZodError} Si los parámetros de paginación o filtros no cumplen con el esquema de validación.
 */
const listadoTipoClases = async ( listado : ListadoTipoInput)
:Promise<TipadoData<ResulListadoTipoUsuarios[]>>  => {

    const dataListado : ListadoTipoInput = ListaTipoUsuariosSchema.parse( listado );
  
    const dataResult = await dataTipo.listado(dataListado , dataListado.pagina);

    if ( dataResult.code === 'TIPO_LISTED' ) {
        return {
            error : false, 
            message : "Listado tipo de clases.",
            data : dataResult.data,
            paginacion  : dataResult.paginacion,
            code : "TIPO_CLASE_LISTADO_OK"
        };
    };

    if ( dataResult.code === 'NO_ACTIVE_TIPO' ) {
        return {
            error : true,
            message : "Sin listado de tipo de clases.",
            code   : "SIN_LISTADO_TIPO_CLASE"
        };
    };

     return{
        error : true, 
        message : "Error en el servidor, intente nuevamente mas tarde.",
        code : "ERROR_SERVIDOR"
     };  

};


/**
 * Servicio encargado de obtener un listado completo de tipos de clase sin paginación.
 * * Valida los parámetros de filtrado mediante `ListaTipoUsuarioSinPagSchema`,
 * consulta la capa de datos para obtener todos los registros que coincidan,
 * y retorna un objeto de respuesta con los datos o el estado de error correspondiente.
 *
 * @async
 * @function listadoTipoClasesSinPag
 * @param {ListadoTipoSinPagInput} listado - Objeto que contiene los filtros de búsqueda opcionales.
 * @returns {Promise<TipadoData<{id: number, tipo: string}[]>>} Objeto de respuesta tipado:
 * - TIPO_CLASE_LISTADO_OK: Se obtuvo el listado completo exitosamente.
 * - SIN_LISTADO_TIPO_CLASE: No se encontraron registros que coincidan con los filtros.
 * - ERROR_SERVIDOR: Fallo inesperado en la capa de datos.
 * @throws {ZodError} Si los filtros de entrada no cumplen con el esquema de validación.
 */
const listadoTipoClasesSinPag = async ( listado :ListadoTipoSinPagInput )
: Promise<TipadoData<{ id : number, tipo : string}[]>> => {

    const dataListado  : ListadoTipoSinPagInput = ListaTipoUsuarioSinPagSchema.parse( listado );
  
    const dataResult = await dataTipo.listadoSinPaginacion(dataListado );

    if ( dataResult.code === 'TIPO_LISTED' ) {
        return {
            error : false, 
            message : "Listado tipo de clases.",
            data : dataResult.data,
            code : "TIPO_CLASE_LISTADO_OK"
        };
    };

    if ( dataResult.code === 'NO_ACTIVE_TIPO' ) {
        return {
            error : true,
            message : "Sin listado de tipo de clases.",
            code   : "SIN_LISTADO_TIPO_CLASE"
        };
    };

     return{
        error : true, 
        message : "Error en el servidor, intente nuevamente mas tarde.",
        code : "ERROR_SERVIDOR"
     };  

};

export const method = {
    altaTipoClase : tryCatchDatos( altaTipoClase ),
    modTipoClase  : tryCatchDatos( modTipoClase ),
    estadoTipo    : tryCatchDatos( estadoTipo ),
    listadoTipoClases : tryCatchDatos( listadoTipoClases ),
    listadoTipoClasesSinPag : tryCatchDatos( listadoTipoClasesSinPag )
};
