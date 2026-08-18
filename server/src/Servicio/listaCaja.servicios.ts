import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as listaCajaData} from "../data/listaCajas.data";

import { TipadoData } from "../tipados/tipado.data";
import { InputConvinados, SchemaFinal, 
         EstadoCajaInput, EstadoCajaSchema,
         LibroDiarioInput, LibroDiarioSchema,   
} from "../squemas/listaCajas";

import { DataEstadoResult, HistorialCaja, 
         DataResultMetodosPagos, CajasServicioResponse,
         ReturnUsuarioEscuelas,  MovimientoLibroDiario      
} from "../data/listaCajas.data";



const encabezadoHistorialCajaServicio = async( id : EstadoCajaInput)
:Promise<TipadoData<DataEstadoResult>> =>{

    const id_escuela : EstadoCajaInput = EstadoCajaSchema.parse(id);

    const resultEstado = await listaCajaData.listaEstadoCaja(id_escuela);

    if ( resultEstado.code === 'ESTADO_CAJA_NO_EXISTE'){
        return{
            error : true,
            message : "Sin caja abierta",
            code : "CAJA_CERRADADA_HISTORIAL"
        }
    }

    if ( resultEstado.code === 'ESTADO_CAJA_EXISTE' ){

          return{
            error : false,
            message : "Tareas realizadas con exito.",
            data : resultEstado.data as DataEstadoResult ,
            code : "HISTORIAL_CAJA_ESTADO_OK"
        };      

    };

    return{
        error : true, 
        message : "Error en el servidor, en Historial cajas.",
        code : "ERROR_SERVIDOR"
    };

};


/**
 * Servicio optimizado que procesa exclusivamente el historial de cajas cerradas 
 * y las métricas por método de pago, aplicando validaciones con Zod 
 * sobre los parámetros de entrada.
 *
 * @async
 * @function listaCajasServicio
 * @param {InputConvinados} data - Objeto con los parámetros de entrada y filtros (fechas, paginación, ID de usuario, etc.).
 * 
 * @returns {Promise<TipadoData<CajasServicioResponse>>} Promesa que resuelve con la estructura de datos unificada, 
 *          conteniendo el detalle del historial, las métricas de pago, la información de paginación y códigos de estado.
 * 
 * @throws {ZodError} Si la validación de entrada con `SchemaFinal` falla.
 * 
 * @example
 * const respuesta = await listaCajasServicio({
 *     id_escuela: 1,
 *     fechaDesde: '2026-04-01',
 *     fechaHasta: '2026-04-30',
 *     idUsuarioFiltro: null,
 *     estadoDiferencia: null,
 *     limit: 15,
 *     pagina: 1,
 *     offset: 0
 * });
 */

const listaCajasServicio = async ( data : InputConvinados)
: Promise<TipadoData<CajasServicioResponse>> =>{

    const dataValidada : InputConvinados = SchemaFinal.parse( data );
   // console.log(dataValidada)


    const resultHistorialCajas = await listaCajaData.detalleCajasCerradas( dataValidada );
    const resultMetodosPago = await listaCajaData.metricasMetodoPagoCajas( dataValidada);


    const sinDetalle = resultHistorialCajas.code === 'NO_ACTIVE_HISTORIAL_CAJAS';   
    const sinMetodos = resultMetodosPago.code === 'NO_ACTIVE_METODOS_DATOS'

 
    if( ( resultHistorialCajas.code === 'HISTORIAL_CAJAS_CERRADAS') || (  sinDetalle || sinMetodos) ){

        const dataDetalle : HistorialCaja[] | null  = sinDetalle ? null : (resultHistorialCajas.data ?? null);
        const dataMetodo  : DataResultMetodosPagos[] | null = sinMetodos ? null : (resultMetodosPago.data ?? null );


        return{
            error : false,
            message : "Tareas realizadas con exito.",
            data : {
                 dataDetalle , dataMetodo
            },
            paginacion : resultHistorialCajas.paginacion,
            code : "HISTORIAL_CAJA_OK"
        };
    };

    return{
        error : true, 
        message : "Error en el servidor , listado de cajas.",
        code : "ERROR_SERVIDOR"
    };

};


/**
 * Valida los datos de entrada mediante un esquema Zod, consulta los usuarios de una escuela 
 * a través de la capa de datos y procesa la respuesta para retornar un formato estandarizado.
 *
 * @async
 * @function usuariosEscuela
 * @param {EstadoCajaInput} id - Objeto de entrada que contiene el identificador de la escuela a consultar (`id_escuela`).
 * @throws {ZodError} Si la validación de los datos a través de `EstadoCajaSchema` no cumple con el formato esperado.
 * @returns {Promise<TipadoData<ReturnUsuarioEscuelas[]>>} Retorna una promesa con un objeto TipadoData:
 * - Si es exitoso (`error: false`): Retorna la lista de usuarios con el código `"LISTA_USUARIOS_OK"`.
 * - Si no se encuentran usuarios (`error: true`): Retorna el código `"SIN_USUARIOS_ESCUELA"`.
 * - Si ocurre un error inesperado (`error: true`): Retorna el código `"ERROR_SERVIDOR"`.
 */
const usuariosEscuela = async( id : EstadoCajaInput)
:Promise<TipadoData<ReturnUsuarioEscuelas[]>> =>{

    const validarData : EstadoCajaInput = EstadoCajaSchema.parse( id );
    
    const resultUsuarios = await listaCajaData.usuarioEscuela( validarData );


    if ( resultUsuarios.code === 'LISTA_USUARIOS_ESCUELA_LISTED') {
        return {
            error : false, 
            message : "Lista de usuarios ok.",
            data : resultUsuarios.data ,
            code : "LISTA_USUARIOS_OK"
        }
    };

    if ( resultUsuarios.code ===  'NO_ACTIVE_LISTA_USUARIOS_ESCUELA' ){
        return {
            error : true, 
            message : "Sin usuarios en esta escuela.",
            code : "SIN_USUARIOS_ESCUELA"
        }
    }

    return{
        error : true, 
        message : "Error en el servidor , listado de cajas.",
        code : "ERROR_SERVIDOR"
    };
};


/**
 * Valida los datos de entrada para el libro diario mediante un esquema Zod, 
 * solicita los detalles de la caja a la capa de datos y procesa la respuesta 
 * para estandarizar el formato devuelto al controlador.
 *
 * @async
 * @function libroDiario
 * @param {LibroDiarioInput} data - Objeto de entrada con el identificador de la caja (`id_caja`).
 * @throws {ZodError} Si la validación de los datos a través de `LibroDiarioSchema` falla.
 * @returns {Promise<TipadoData<MovimientoLibroDiario[]>>} Retorna una promesa con un objeto TipadoData:
 * - Si es exitoso (`error: false`): Devuelve la lista de movimientos con el código `"LISTADO_DETALLE_CAJA_OK"`.
 * - Si la caja no tiene registros (`error: true`): Devuelve el código `"CAJA_SIN_DETALLE"`.
 * - Si ocurre un error inesperado (`error: true`): Devuelve el código `"ERROR_SERVIDOR"`.
 */
const libroDiario = async ( data : LibroDiarioInput )
: Promise<TipadoData<MovimientoLibroDiario[]>> => {

    const dataValidada : LibroDiarioInput = LibroDiarioSchema.parse( data );

    const resultLibroDiario = await listaCajaData.libroDiarioDetalle( dataValidada );

    if ( resultLibroDiario.code === 'DETALLE_CAJA_RESUMEN_LISTED' ){
        return {
            error : false, 
            message : "Libro diario listado correctamente.",
            data : resultLibroDiario.data,
            code : "LISTADO_DETALLE_CAJA_OK"
        }
    };

    if ( resultLibroDiario.code ===  'NO_ACTIVE_DETALLE_CAJA_RESUMEN' ){
        return {
            error : true, 
            message : "Esta caja no contiene detalles.",
            code : "CAJA_SIN_DETALLE"
        }
    };    

    return{
        error : true, 
        message : "Error en el servidor , Libro diario resumen.",
        code : "ERROR_SERVIDOR"
    };    

};



export const method = {
    estadoCaja : tryCatchDatos(encabezadoHistorialCajaServicio),
    listaCajasServicio : tryCatchDatos( listaCajasServicio),
    usuariosEscuela    : tryCatchDatos( usuariosEscuela),
    libroDiario        : tryCatchDatos( libroDiario ),
};

