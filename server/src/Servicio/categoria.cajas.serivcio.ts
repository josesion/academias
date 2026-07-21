
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as categoriaCajaData } from "../data/categoria.cajas.data";
import { registroHistorial } from "../utils/postHistorial";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { CategoriaCajaInpurts , CategoriaCajaSchema,
         ModCategoriaCajaInputs , ModCategoriaCajaSchema,   
         BajaCategoriCajaInputs, BajaCategoriaCajaSchema,
         ListadoCategoriaCajaInputs, ListaCategoriaCajaSchema,
         CategoriaCajaInscripcionInputs, CategoriaCajaInscripcionSchema,
 }  from "../squemas/categoria.caja";
import { type HistorialInputs } from "../squemas/historial";
import { TipadoData } from "../tipados/tipado.data";
import { DataCategoriaCajas, ResultListadoCategoriaCaja } from "../tipados/categoria.caja.tiapado";
import { Tipo_movimiento } from "../squemas/cajas";


/**
 * Servicio encargado de verificar la existencia de la categoría 'Inscripcion' para una escuela.
 * * Este método valida los inputs mediante un Schema (Zod), consulta la existencia en la 
 * capa de datos y mapea los resultados a códigos de respuesta internos. Se utiliza 
 * principalmente para asegurar que los procesos de pago automatizados tengan una 
 * categoría válida a la cual asociarse.
 *
 * @param {CategoriaCajaInscripcionInputs} data - Objeto que contiene el id_escuela a validar.
 * @returns {Promise<TipadoData<{id_categoria : number}>>} Objeto de respuesta tipado:
 * - CATEGORIA_INSCRIPCION_OK: Si se encontró el ID de la categoría obligatoria.
 * - SIN_CATEGORIA_INSCRIPCION: Si la escuela no tiene la categoría creada (falló el trigger o se borró).
 * - ERROR_CATEGORIA_CAJA_INSCRIPCION: Error genérico ante fallos en la consulta o validación.
 * * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */
const verificacionInscripcionCategoria = async ( data : CategoriaCajaInscripcionInputs)
: Promise<TipadoData<{id_categoria : number}>> => {
  
    const dataCatInscripcion : CategoriaCajaInscripcionInputs = CategoriaCajaInscripcionSchema.parse( data )
   
    const dataCatInscripcionResult = await categoriaCajaData.localizarIncripcionCategortia(dataCatInscripcion);
    
    if ( dataCatInscripcionResult.code === "ID_INSCRIPCION_CATCAJA_NO_EXISTE"){
        return{
            error : true,
            message : "No existe esta categoria inscripcion",
            code : "SIN_CATEGORIA_INSCRIPCION"
        };
    };
    if ( dataCatInscripcionResult.code === "ID_INSCRIPCION_CATCAJA_EXISTE"){
        return{
            error : false,
            message : "Existe la categoria Obligatoria en categorias cajas",
            data : dataCatInscripcionResult.data,
            code : "CATEGORIA_INSCRIPCION_OK"
        };
    };
    
    return {
        error: true,
        message: `Se produjo un error en la veridicacion de categoria Inscripcion`,
        code: "ERROR_SERVIDOR"
    };
};


/**
 * Servicio encargado de gestionar el alta de una nueva categoría de caja,
 * validando que no existan duplicados y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CategoriaCajaSchema`.
 * 2. Comprueba si la categoría ya existe en el sistema (`CATEGORIA_CAJA_EXISTE`); de ser así, deniega el registro.
 * 3. Ejecuta la inserción en la capa de datos (`categoriaCajaData.altaCategoriaCaja`).
 * 4. Si la operación es exitosa (código 'CATEGORIA_CAJA_CREAR'):
 *    - Construye el objeto con los detalles de la categoría recién creada para el historial.
 *    - Registra el evento de auditoría en el sistema mediante `registroHistorial`.
 * 5. Retorna el resultado estandarizado con el mensaje de éxito, los datos devueltos y su código correspondiente.
 *
 * @async
 * @function altaCategoriaCajaServicio
 * @param {CategoriaCajaInpurts} data - Objeto con los datos necesarios para dar de alta la categoría 
 * (incluyendo nombre, tipo de movimiento, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<DataCategoriaCajas>>} Promesa que resuelve con el estado de la alta,
 * incluyendo mensajes descriptivos, datos de respuesta y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `CategoriaCajaSchema`.
 * 
 * @example
 * const resultado = await altaCategoriaCajaServicio({
 *    nombre_categoria: "Inscripciones",
 *    tipo_movimiento: "INGRESO",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const altaCategoriaCajaServicio = async (data: CategoriaCajaInpurts)
: Promise<TipadoData<DataCategoriaCajas>> => {
    
    const dataCategoriaCaja : CategoriaCajaInpurts = CategoriaCajaSchema.parse(data);
    
   const categoriaExistente = await categoriaCajaData.verificarCategoriaExistente(dataCategoriaCaja);
    
    if (categoriaExistente.code === "CATEGORIA_CAJA_EXISTE") {
        return {
            error: true,
            message: `La categoría: ${dataCategoriaCaja.nombre_categoria} ya existe`,
            code: "CATEGORIA_CAJA_EXISTENTE"
        };
    };

    const resultado = await categoriaCajaData.altaCategoriaCaja(dataCategoriaCaja);
  
    if (resultado.code === "CATEGORIA_CAJA_CREAR") {

        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataCategoriaCaja.id_escuela ,
            id_usuario :  dataCategoriaCaja.id_usuario,
            modulo : "CATEGORIAS_CAJA",
            accion : "CREAR",
            id_registro: Number(resultado.data?.id),
            descripcion: `Alta cat. caja :${dataCategoriaCaja.nombre_categoria}`,
            datos: {
                nombre_categoria : resultado.data?.nombre_categoria,
                Tipo_movimiento  : resultado.data?.tipo_movimiento,
                id_categoria_caja : resultado.data?.id
            }
         }; 

        await registroHistorial( dataHistorial);           

        return {
            error: false,
            message: `La categoría: ${dataCategoriaCaja.nombre_categoria} se ha dado de alta con éxito`,
            code: "CATEGORIA_CAJA_ALTA",
            data: resultado.data
        };
    };

    return {
        error: true,
        message: `No se pudo completar el alta de: ${dataCategoriaCaja.nombre_categoria}`,
        code: "ERROR_SERVIDOR"
    };
};


/**
 * Servicio encargado de gestionar la modificación de una categoría de caja,
 * validando restricciones del sistema, duplicados y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModCategoriaCajaSchema`.
 * 2. Verifica la existencia de la categoría y comprueba si es de tipo sistema (`categoria_sistema`); de ser así, deniega la operación con un error de permisos.
 * 3. Valida que el nuevo nombre o datos no generen un conflicto de duplicidad (`CATEGORIA_CAJA_EXISTE`).
 * 4. Ejecuta la modificación en la capa de datos (`categoriaCajaData.modCategoriaCaja`).
 * 5. Si la operación es exitosa (código 'CATEGORIA_CAJA_MODIFICAR'):
 *    - Construye el objeto con los detalles de los cambios realizados.
 *    - Registra el evento de auditoría en el sistema mediante `registroHistorial`.
 * 6. Retorna el resultado estandarizado con el mensaje de éxito, los datos devueltos y su código correspondiente.
 *
 * @async
 * @function modCategoriaCaja
 * @param {ModCategoriaCajaInputs} data - Objeto con los datos necesarios para modificar la categoría 
 * (incluyendo ID de categoría, nuevo nombre, tipo de movimiento, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{id_categoria: number}>>} Promesa que resuelve con el estado de la modificación,
 * incluyendo mensajes descriptivos, datos de respuesta y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `ModCategoriaCajaSchema`.
 * 
 * @example
 * const resultado = await modCategoriaCaja({
 *    id_categoria: 2,
 *    nombre_categoria: "Gastos Operativos",
 *    tipo_movimiento: "EGRESO",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const modCategoriaCaja = async( data : ModCategoriaCajaInputs)
: Promise<TipadoData<{id_categoria : number}>>  => {
    const dataMod : ModCategoriaCajaInputs = ModCategoriaCajaSchema.parse(data);

    const verificarCategoriaExistente = await categoriaCajaData.verificarCategoriaExistente( dataMod );

    if( verificarCategoriaExistente.data?.categoria_sistema){
  
        return {
            error : true,
            message : "Sin permisos campo de sistema",
            code : "SIN_PERMISOS" 
        };
    };

    if ( verificarCategoriaExistente.code === "CATEGORIA_CAJA_EXISTE"){
        return{
            error : true,
            message :  `La categoría: ${dataMod.nombre_categoria} ya existe`,
            code : "CATEGORIA_CAJA_EXISTENTE"
        };
    };
  
    const modResultado = await categoriaCajaData.modCategoriaCaja(dataMod);
  
    if ( modResultado.code === "CATEGORIA_CAJA_MODIFICAR"){
      
         const dataHistorial  : HistorialInputs = {
            id_escuela :  dataMod.id_escuela ,
            id_usuario :  dataMod.id_usuario,
            modulo : "CATEGORIAS_CAJA",
            accion : "MODIFICAR",
            id_registro: Number(modResultado.data?.id_categoria),
            descripcion: `Modificacion cat. caja :${dataMod.nombre_categoria}`,
            datos: {
                nombre_categoria : dataMod.nombre_categoria,
                Tipo_movimiento  : dataMod.tipo_movimiento,
                id_categoria_caja : dataMod.id_categoria
            }
         }; 

        await registroHistorial( dataHistorial);     

        return {
            error : false,
            message : modResultado.message,
            data : modResultado.data,
            code : modResultado.code
        };
    }
   return {
        error : true,
        message : `No se pudo completar la modificacion : ${dataMod.nombre_categoria}`,
        code :"ERROR_SERVIDOR"
   };
};


/**
 * Servicio encargado de gestionar la baja o activación (cambio de estado) de una categoría de caja,
 * validando restricciones del sistema y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada utilizando el esquema `BajaCategoriaCajaSchema`.
 * 2. Verifica si la categoría es de tipo sistema (`categoria_sistema`); de ser así, deniega la operación.
 * 3. Ejecuta la modificación de estado en la capa de datos (`categoriaCajaData.bajaCategoriaCaja`).
 * 4. Si la operación es exitosa (código 'CATEGORIA_CAJA_ELIMINAR'):
 *    - Determina dinámicamente la acción de auditoría ('RESTAURAR' o 'ELIMINAR').
 *    - Construye el mensaje descriptivo y el objeto de datos para el historial.
 *    - Registra el evento en el sistema de auditoría mediante `registroHistorial`.
 * 5. Retorna el resultado estandarizado con el mensaje y código correspondiente.
 *
 * @async
 * @function bajaCategoriaCaja
 * @param {BajaCategoriCajaInputs} data - Objeto con los datos necesarios para cambiar el estado 
 * (incluyendo ID de categoría, estado deseado, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<BajaCategoriCajaInputs>>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes personalizados, datos de respuesta y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `BajaCategoriaCajaSchema`.
 * 
 * @example
 * const resultado = await bajaCategoriaCaja({
 *    id_categoria: 3,
 *    estado: "inactivos",
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    nombre_categoria: "Ventas"
 * });
 */
const bajaCategoriaCaja = async( data : BajaCategoriCajaInputs ) 
: Promise<TipadoData<BajaCategoriCajaInputs>>=>{
   
    const  dataCategoriaCaja : BajaCategoriCajaInputs = BajaCategoriaCajaSchema.parse( data );
   
    const verificarCategoriaExistente = await categoriaCajaData.verificarCategoriaExistente2( data );
    
    if( verificarCategoriaExistente.data?.categoria_sistema){
  
        return {
            error : true,
            message : "Sin permisos campo de sistema",
            code : "SIN_PERMISOS" 
        };
    };

    const bajaCategoria = await categoriaCajaData.bajaCategoriaCaja(dataCategoriaCaja);

    if ( bajaCategoria.code === "CATEGORIA_CAJA_ELIMINAR"){// quiere decir q cambio el estado correctamente 
        
        let setEstadoMensaje : string = dataCategoriaCaja.estado;
        const accionFinal = dataCategoriaCaja.estado === 'activos' ? "RESTAURAR" : "ELIMINAR" ;
        const estadoFinal  = dataCategoriaCaja.estado === "activos" ? "activo" : "inactivo";

        if ( dataCategoriaCaja.estado === "activos"){
            setEstadoMensaje = "La Categoria esta activa"
           
        }else {
            setEstadoMensaje = "La Categoria esta inactiva"
        };

        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataCategoriaCaja.id_escuela ,
            id_usuario :  dataCategoriaCaja.id_usuario || 0,
            modulo : "CATEGORIAS_CAJA",
            accion : accionFinal,
            id_registro: Number(dataCategoriaCaja.id_categoria),
            descripcion: `Estado de ${dataCategoriaCaja.nombre_categoria} cambio a  ${estadoFinal}`,
            datos: {
                id_categoria : dataCategoriaCaja.id_categoria,
                estado : dataCategoriaCaja.estado,
            }
        }; 
           
        await registroHistorial( dataHistorial);  

        return{
            error : false,
            message : setEstadoMensaje,
            data   : bajaCategoria.data,
            code   : "CATEGORIA_CAJA_ESTADO_OK"
        };
    };

    return{
        error : true,
        message : `No se pudo completar la modificacion de estado : ${dataCategoriaCaja.id_categoria}`,
        code :"ERROR_SERVIDOR"   
    };  

};

/**
 * Obtiene un listado paginado de las categorías de caja basado en filtros opcionales.
 * 
 * Calcula el desplazamiento (offset) a partir del número de página y el límite,
 * valida los datos de entrada mediante un esquema y gestiona las respuestas 
 * de la capa de datos.
 *
 * @async
 * @function listadoCategoriaCaja
 * @param {ListadoCategoriaCajaInputs} data - Objeto con los parámetros de filtrado y paginación.
 * @param {string|number} data.pagina - Número de la página actual.
 * @param {string|number} data.limit - Cantidad de registros por página.
 * @param {string} [data.nombre_categoria] - Filtro opcional por nombre de categoría.
 * @param {string} [data.tipo_movimiento] - Filtro opcional por tipo de movimiento.
 * @param {string} [data.estado] - Filtro opcional por estado de la categoría.
 * @param {string} data.id_escuela - Identificador de la escuela asociada.
 * 
 * @returns {Promise<TipadoData<ResultListadoCategoriaCaja[]>>} Promesa que resuelve con:
 * - error (boolean): Indica si la operación falló.
 * - message (string): Mensaje explicativo del resultado.
 * - data (ResultListadoCategoriaCaja[] | undefined): Listado de categorías obtenidas.
 * - paginacion (any | undefined): Información sobre la paginación (si aplica).
 * - code (string): Código de respuesta ('LISTADO_CATEGORIA_CAJA', 'SIN_LISTADO_CATEGORIA_CAJA', 'ERROR_SERVIDOR').
 * 
 * @throws {ZodError} Si la validación de `ListaCategoriaCajaSchema` falla.
 */
const listadoCategoriaCaja = async( data : ListadoCategoriaCajaInputs )
:Promise<TipadoData<ResultListadoCategoriaCaja[]>> =>{
 
   const offset = ( Number(data.pagina) -1 ) * Number(data.limit) ;

   const dataParseada = {
      nombre_categoria : data.nombre_categoria,
      tipo_movimiento  : data.tipo_movimiento,
      estado           : data.estado,
      id_escuela       : data.id_escuela,
      limit            : data.limit,
      pagina           : data.pagina,
      offset           : offset     
   };
    const dataListado : ListadoCategoriaCajaInputs = ListaCategoriaCajaSchema.parse(dataParseada);

    const resultadoListado = await categoriaCajaData.listadoCategoriaCaja(dataListado);

   if ( resultadoListado.code === 'CATEGORIA_CAJA_LISTED'){
        return {
            error : false,
            message : resultadoListado.message,
            data : resultadoListado.data,
            paginacion : resultadoListado.paginacion,
            code  : "LISTADO_CATEGORIA_CAJA"
        };
   };

   if ( resultadoListado.code === 'NO_ACTIVE_CATEGORIA_CAJA'){
        return {
            error : true,
            message : "Sin listado, modifar el filtrado.",
            code  : "SIN_LISTADO_CATEGORIA_CAJA"
        };    
   };

    return{
        error : true,
        message : `Error en el servidor en obtener el listado`,
        code :"ERROR_SERVIDOR"   
    };  

};



export const method = {
    altaCategoriaCajaServicio : tryCatchDatos(altaCategoriaCajaServicio),
    modCategoriaCaja          : tryCatchDatos( modCategoriaCaja ),
    bajaCategoriaCaja         : tryCatchDatos( bajaCategoriaCaja),
    listadoCategoriaCaja      : tryCatchDatos( listadoCategoriaCaja ),
    verificacionInscripcionCategoria : tryCatchDatos( verificacionInscripcionCategoria ),
};