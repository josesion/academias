import { select } from "../utils/baseDatos";

import { TipadoData } from "../tipados/tipado.data";

interface ParametrosListaGenerica  {
    slqListado  :   string,
    valores     :   unknown[],// por q podria recibir cual tipo de dato
    entidad     :   string,
    estado      :   string
}

/**
 * @typedef {object} ParametrosListaGenerica
 * @property {string} slqListado - La consulta SQL a ejecutar para obtener el listado.
 * @property {unknown[]} valores - Array de valores a ser interpolados en la consulta SQL (para evitar inyección).
 * @property {string} entidad - El nombre de la entidad (ej: "Plan", "Alumno"). Se usa para generar mensajes y códigos de error.
 * @property {string} estado - El estado de la entidad listada (ej: "Activos", "Eliminados"). Se usa para generar mensajes.
 */

/**
 * @typedef {object} TipadoData<T>
 * @property {boolean} error - Indica si ocurrió un error en la operación.
 * @property {string} message - Mensaje descriptivo del resultado o del error.
 * @property {T} data - El array de resultados (T[]) si no hay error.
 * @property {string} code - Código de error o éxito estandarizado (ej: "PLAN_LISTED").
 * @property {any} [paginacion] - Siempre undefined en esta función.
 * @property {any} [errorsDetails] - Detalles del error, si aplica.
 */

/**
 * Servicio genérico para listar entidades de la base de datos sin aplicar paginación.
 * * Esta función es reutilizable y maneja la respuesta envolviéndola en un objeto TipadoData, 
 * lo que asegura un manejo consistente de errores y resultados en la capa de negocio.
 *
 * @template TRespuesta El tipo de dato esperado para cada fila del resultado (ej: DataPlan, DataAlumno).
 * @param {ParametrosListaGenerica} parametros - Objeto con la consulta SQL y metadatos de la entidad.
 * @returns {Promise<TipadoData<TRespuesta[]>>} - Una promesa que resuelve a un objeto TipadoData 
 * conteniendo el array de entidades (TRespuesta[]) o un error.
 */

export const listarEntidadSinPaginacion = async <TRespuesta>( parametros : ParametrosListaGenerica)
 : Promise<TipadoData<TRespuesta[]>> =>{
    const { entidad , estado, slqListado , valores} = parametros;
    const  entidadM = entidad.toUpperCase();

    type Row = TRespuesta ;

    const listado = await select<Row>(slqListado, valores);

    if ( listado.length <= 0) {
        // Cuando no hay resultados devolvemos un TipadoData consistente
        // en lugar de lanzar una excepción. Esto mantiene la misma
        // forma de retorno que usan otros hooks (error:true + code)
        return {
            error: true,
            message: `No hay ${entidadM} ${estado}`,
            data: [],
            paginacion: undefined,
            code: `NO_ACTIVE_${entidadM}`,
            errorsDetails: undefined
        } as unknown as TipadoData<TRespuesta[]>;
    };

      return {
        error: false,
        message: ` ${entidadM} listados ${estado}`,
        data: listado ,
        code:  `${entidadM}_LISTED`,
        errorsDetails: undefined
    };    

};