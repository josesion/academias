
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
         ListadoCategoriaCajaInputs, ListaCategoriaCajaSchema
 }  from "../squemas/categoria.caja";

import { TipadoData } from "../tipados/tipado.data";
import { DataCategoriaCajas, ResultListadoCategoriaCaja } from "../tipados/categoria.caja.tiapado";


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
        code: "ERROR_ALTA_CATEGORIA_CAJA"
    };
};

/**
 * Servicio de lógica de negocio para la actualización de categorías de caja.
 * * El proceso sigue este flujo de integridad:
 * 1. Validación de esquema: Asegura que los datos recibidos cumplen el contrato técnico.
 * 2. Validación de unicidad: Verifica que el nuevo nombre no colisione con otra categoría existente 
 * (considerando escuela y tipo de movimiento).
 * 3. Persistencia: Ejecuta la modificación en la base de datos si las validaciones previas son exitosas.
 * * @async
 * @function modCategoriaCaja
 * @param {ModCategoriaCajaInputs} data - Objeto con los datos actualizados y el ID del registro.
 * @returns {Promise<TipadoData<{id_categoria : number}>>} Objeto de respuesta estandarizado para la UI.
 * * @example
 * const respuesta = await modCategoriaCaja({
 * id_categoria: 15,
 * nombre_categoria: "Materiales Didácticos",
 * tipo_movimiento: "egreso",
 * id_escuela: 1
 * });
 */
const modCategoriaCaja = async( data : ModCategoriaCajaInputs)
: Promise<TipadoData<{id_categoria : number}>>  => {
    const dataMod : ModCategoriaCajaInputs = ModCategoriaCajaSchema.parse(data);
   
    const verificarCategoriaExistente = await categoriaCajaData.verificarCategoriaExistente( dataMod );
   

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
        code :"ERROR_MOD_CATEGORIA_CAJA"
   };
};

/**
 * Servicio de lógica de negocio para la gestión del estado (alta/baja lógica) de una categoría.
 * * Esta función actúa como un puente que valida el esquema de entrada y personaliza 
 * la respuesta basada en el nuevo estado asignado, facilitando el feedback en la interfaz.
 * * @async
 * @function bajaCategoriaCaja
 * @param {BajaCategoriCajaInputs} data - Objeto que contiene el ID de la categoría, la escuela y el nuevo estado.
 * @returns {Promise<TipadoData<BajaCategoriCajaInputs>>} Promesa que resuelve a un objeto de respuesta 
 * con mensajes personalizados según si la categoría fue activada o desactivada.
 * * @example
 * // Para desactivar una categoría
 * const respuesta = await bajaCategoriaCaja({ id_categoria: 1, id_escuela: 10, estado: 'inactivos' });
 * // respuesta.message -> "La Categoria esta inactiva"
 */
const bajaCategoriaCaja = async( data : BajaCategoriCajaInputs ) 
: Promise<TipadoData<BajaCategoriCajaInputs>>=>{
    const  dataCategoriaCaja : BajaCategoriCajaInputs = BajaCategoriaCajaSchema.parse( data );

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
        code :"ERROR_ESTADO_CATEGORIA_CAJA"   
    };  

};

/**
 * Orquestador del listado de categorías. Se encarga de la lógica de paginación y validación de filtros.
 * * * Realiza las siguientes tareas:
 * 1. Calcula el `offset` dinámico basado en la página y el límite de registros.
 * 2. Normaliza y valida los datos de entrada con `ListaCategoriaCajaSchema`.
 * 3. Solicita los datos a la capa de persistencia y estandariza la respuesta de éxito o error.
 * * @async
 * @function listadoCategoriaCaja
 * @param {ListadoCategoriaCajaInputs} data - Parámetros crudos recibidos desde el controlador/query.
 * @param {number|string} data.pagina - Número de página actual (1-based).
 * @param {number|string} data.limit - Cantidad de registros por página.
 * @returns {Promise<TipadoData<ResultListadoCategoriaCaja[]>>} Objeto de respuesta que incluye los datos, 
 * metadatos de paginación y códigos de estado para la UI.
 * * @example
 * const res = await listadoCategoriaCaja({ pagina: 2, limit: 10, id_escuela: 1, estado: 'activos' });
 * // Si pagina=2 y limit=10, el offset será 10.
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

    if (resultadoListado.error === false){
        return {
            error : false,
            message : resultadoListado.message,
            data : resultadoListado.data,
            paginacion : resultadoListado.paginacion,
            code  : "LISTADO_CATEGORIA_CAJA"
        };
    }else{
        return {
            error : true,
            message : resultadoListado.message,
            code : "SIN_LISTADO_CATEGORIA_CAJA"
        };
    };
    
};

export const method = {
    altaCategoriaCajaServicio : tryCatchDatos(altaCategoriaCajaServicio),
    modCategoriaCaja          : tryCatchDatos( modCategoriaCaja ),
    bajaCategoriaCaja         : tryCatchDatos( bajaCategoriaCaja),
    listadoCategoriaCaja      : tryCatchDatos( listadoCategoriaCaja )
};