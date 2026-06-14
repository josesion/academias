
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as categoriaCajaData } from "../data/categoria.cajas.data";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { CategoriaCajaInpurts , CategoriaCajaSchema,
         ModCategoriaCajaInputs , ModCategoriaCajaSchema,   
         BajaCategoriCajaInputs, BajaCategoriaCajaSchema,
         ListadoCategoriaCajaInputs, ListaCategoriaCajaSchema,
         CategoriaCajaInscripcionInputs, CategoriaCajaInscripcionSchema,
 }  from "../squemas/categoria.caja";

import { TipadoData } from "../tipados/tipado.data";
import { DataCategoriaCajas, ResultListadoCategoriaCaja } from "../tipados/categoria.caja.tiapado";


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
 * Servicio de lógica de negocio para el registro de nuevas categorías de caja.
 * * Realiza tres pasos críticos:
 * 1. Valida la estructura de los datos mediante `CategoriaCajaSchema`.
 * 2. Verifica la existencia previa de la categoría para evitar duplicados.
 * 3. Ejecuta el alta en la base de datos si las validaciones son exitosas.
 * * @async
 * @function altaCategoriaCajaServicio
 * @param {CategoriaCajaInpurts} data - Datos brutos de la categoría a registrar.
 * @returns {Promise<TipadoData<DataCategoriaCajas>>} Objeto de respuesta estandarizado con el resultado de la operación.
 * * @example
 * const respuesta = await altaCategoriaCajaServicio({
 * nombre_categoria: "Venta de Uniformes",
 * id_escuela: 1,
 * tipo_movimiento: "ingreso"
 * });
 */
const altaCategoriaCajaServicio = async (data: CategoriaCajaInpurts)
: Promise<TipadoData<DataCategoriaCajas>> => {
    
    const dataCategoriaCaja = CategoriaCajaSchema.parse(data);
    
   const categoriaExistente = await categoriaCajaData.verificarCategoriaExistente(dataCategoriaCaja);
    
    if (categoriaExistente.code === "CATEGORIA_CAJA_EXISTE") {
        return {
            error: true,
            message: `La categoría: ${dataCategoriaCaja.nombre_categoria} ya existe`,
            code: "CATEGORIA_CAJA_EXISTENTE"
        };
    };

    const resultado = await categoriaCajaData.altaCategoriaCaja(dataCategoriaCaja);

    if (resultado.code === "CATEGORIA_CAJA_ALTA") {
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
 * Modifica una categoría de caja.
 *
 * Flujo de validación:
 * 1. Valida los datos de entrada mediante Zod.
 * 2. Verifica si existe una categoría del sistema asociada a la operación.
 *    Las categorías marcadas como `categoria_sistema = 1` no pueden ser
 *    modificadas por usuarios.
 * 3. Verifica que no exista otra categoría con el mismo nombre y tipo de
 *    movimiento dentro de la misma escuela.
 * 4. Ejecuta la modificación de la categoría.
 *
 * Posibles respuestas:
 * - SIN_PERMISOS: Se intentó modificar una categoría protegida del sistema.
 * - CATEGORIA_CAJA_EXISTENTE: Ya existe una categoría con los mismos datos.
 * - CATEGORIA_CAJA_MODIFICAR: Modificación realizada correctamente.
 * - ERROR_SERVIDOR: Error al realizar la modificación.
 *
 * @param {ModCategoriaCajaInputs} data Datos de la categoría a modificar.
 * @returns {Promise<TipadoData<{ id_categoria: number }>>}
 * Resultado de la operación con el id de la categoría modificada.
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
 * Realiza el cambio de estado (baja o activación) de una categoría de caja.
 * * Valida primero que la categoría no sea una categoría de sistema. Si la operación
 * es exitosa, retorna un mensaje descriptivo basado en el nuevo estado.
 *
 * @async
 * @function bajaCategoriaCaja
 * @param {BajaCategoriCajaInputs} data - Objeto con los datos necesarios para la baja/cambio de estado.
 * @param {string} data.id_categoria - Identificador único de la categoría.
 * @param {string} data.estado - Nuevo estado a asignar ('activos' o 'inactivos').
 * * @returns {Promise<TipadoData<BajaCategoriCajaInputs>>} Promesa que resuelve un objeto con:
 * - error (boolean): Indica si hubo un fallo.
 * - message (string): Mensaje informativo o de error.
 * - data (any|null): Datos de la categoría afectada (si tuvo éxito).
 * - code (string): Código de estado de la operación (ej: 'CATEGORIA_CAJA_ESTADO_OK', 'SIN_PERMISOS', 'ERROR_SERVIDOR').
 * * @throws {ZodError} Si la validación de `BajaCategoriaCajaSchema` falla.
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

        if ( dataCategoriaCaja.estado === "activos"){
            setEstadoMensaje = "La Categoria esta activa"
        }else {
            setEstadoMensaje = "La Categoria esta inactiva"
        };

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