import { tryCatchDatos } from "../utils/tryCatchBD";
import { registroHistorial } from "../utils/postHistorial";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as dataTipo } from "../data/tipo_clases.data";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data";
import { type HistorialInputs } from "../squemas/historial";
import { ResulListadoTipoUsuarios } from "../tipados/tipo.data";
import { CrearTipoSchema , CrearTipoInput , ModTipoInput , ModTipoSchema ,
         EstadoTipoInput , EstadoTipoSchema, ListaTipoUsuariosSchema, ListadoTipoInput,
         ListaTipoUsuarioSinPagSchema, ListadoTipoSinPagInput
        } from "../squemas/tipo.usuarios";


/**
 * Servicio encargado de gestionar el alta de un nuevo tipo de clase (baile),
 * validando duplicados en la escuela y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CrearTipoSchema`.
 * 2. Comprueba si el tipo de clase ya existe en la escuela (`TIPO_EXISTE`); de ser así, deniega el registro.
 * 3. Ejecuta la inserción en la capa de datos (`dataTipo.altaTipo`).
 * 4. Si la operación es exitosa (código 'TIPO_CREAR'):
 *    - Construye el objeto con los detalles del tipo de clase recién creado para el historial.
 *    - Registra el evento de auditoría en el sistema mediante `registroHistorial`.
 * 5. Retorna el resultado estandarizado con el mensaje de éxito, o un error de servidor en caso de fallo.
 *
 * @async
 * @function altaTipoClase
 * @param {CrearTipoInput} alta - Objeto con los datos necesarios para dar de alta el tipo de clase 
 * (incluyendo nombre del tipo, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{tipo: string}>>} Promesa que resuelve con el estado de la alta,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `CrearTipoSchema`.
 * 
 * @example
 * const resultado = await altaTipoClase({
 *    tipo: "Salsa",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
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

        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataAlta.id_escuela ,
            id_usuario :  dataAlta.id_usuario,
            modulo : "TIPOS_BAILE",
            accion : "CREAR",
            id_registro: Number(altaResult.data?.id),
            descripcion: `Registro Tipo : ${altaResult.data?.tipo } `,
            datos:{
                id_tipo : altaResult.data?.id,
                tipo_baile : altaResult.data?.tipo
            }
        }; 
            
        await registroHistorial( dataHistorial);   


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
 * Servicio encargado de gestionar la modificación de un tipo de clase (baile existente),
 * validando duplicados en la escuela y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModTipoSchema`.
 * 2. Comprueba si el nuevo nombre del tipo de clase ya existe en la escuela (`TIPO_EXISTE`); de ser así, deniega la modificación.
 * 3. Ejecuta la actualización en la capa de datos (`dataTipo.modficarTipo`).
 * 4. Si la operación es exitosa (código 'TIPO_MODIFICAR'):
 *    - Construye el objeto con los detalles de la modificación para el historial de auditoría.
 *    - Registra el evento en el sistema mediante `registroHistorial`.
 * 5. Retorna el resultado estandarizado con el mensaje de éxito, o un error de servidor en caso de fallo.
 *
 * @async
 * @function modTipoClase
 * @param {ModTipoInput} mod - Objeto con los datos necesarios para modificar el tipo de clase 
 * (incluyendo ID del tipo, nuevo nombre, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{id: number, tipo: string}>>} Promesa que resuelve con el estado de la modificación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `ModTipoSchema`.
 * 
 * @example
 * const resultado = await modTipoClase({
 *    id: 1,
 *    tipo: "Bachata",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
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

        const dataHistorial  : HistorialInputs = {
                id_escuela :  dataMod.id_escuela ,
                id_usuario :  dataMod.id_usuario,
                modulo : "TIPOS_BAILE",
                accion : "MODIFICAR",
                id_registro: Number(dataMod.id),
                descripcion: `Se modifico tipo : ${dataMod.tipo}`,
                datos: {

                }
        }; 
            
        await registroHistorial( dataHistorial);

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
 * Cambia el estado de un tipo de clase (activo/inactivo) y gestiona de forma en cascada 
 * la baja de sus horarios asociados o el registro en el historial al restaurarlo.
 * 
 * @async
 * @function estadoTipo
 * @param {EstadoTipoInput} estado - Objeto que contiene los datos de entrada validados por Zod (id, estado, id_escuela, id_usuario, etc.).
 * @returns {Promise<TipadoData<{ id: number }>>} Retorna un objeto estándar con el resultado de la operación, 
 * indicando si hubo error, un mensaje descriptivo para el cliente, el código de estado y opcionalmente datos.
 * 
 * @throws {ZodError} Si la validación de los datos de entrada falla mediante `EstadoTipoSchema`.
 * @throws {Error} Si ocurre un fallo en la capa de persistencia durante la transacción de baja o restauración.
 */
const estadoTipo = async ( estado : EstadoTipoInput) 
: Promise<TipadoData<{ id: number }>> => {

    const data : EstadoTipoInput = EstadoTipoSchema.parse( estado);
        const estadoFinal  = data.estado === "activos" ? "activo" : "inactivo";

    // ──────────────────────────────────────────────────────────────
    // CASO 1: Dar de baja el tipo de clase y sus horarios asociados
    // ──────────────────────────────────────────────────────────────
        if ( estadoFinal === "inactivo"){

            const bajaTipoHorario = await dataTipo.eliminarTipos_Horario( data );

             if ( bajaTipoHorario.code === 'TRANSACCION_OK'){
                return {
                    error : false,
                    message : "El estado cambio correctamente.",
                    code : "TIPO_CLASE_ESTADO_OK"
                };
             };

             if ( bajaTipoHorario.code === "TRANSACCION_FALLIDA"){
                    return{
                        error : true, 
                        message : "Error al realizar los cambios, intente mas tarde.",
                        code : "TIPO_CLASE_ESTADO_FALLIDO"
                    };
             };

        };

    // ──────────────────────────────────────────────────────────────
    // CASO 2: Restaurar / Activar el tipo de clase y registrar en historial
    // ──────────────────────────────────────────────────────────────
       if ( estadoFinal === "activo"){
          
            const estadoTipo = await dataTipo.estadoTipo(data); 

            if ( estadoTipo.code === 'TIPO_MODIFICAR'){

                const dataHistorial  : HistorialInputs = {
                    id_escuela :  data.id_escuela ,
                    id_usuario :  data.id_usuario,
                    modulo : "TIPOS_BAILE",
                    accion : "RESTAURAR",
                    id_registro: Number(data.id),
                    descripcion: `Estado Tipo baile : ${data.id} cambio a activo.`,
                    datos: {
                        id_tipo_baile : data.id,
                    }
                }; 

                await registroHistorial( dataHistorial);           

                return {
                    error : false,
                    message : "El estado cambio correctamente.",
                    code : "TIPO_CLASE_ESTADO_OK"
                };
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
