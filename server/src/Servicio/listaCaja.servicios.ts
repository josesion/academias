import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as listaCajaData} from "../data/listaCajas.data";

import { TipadoData } from "../tipados/tipado.data";
import { InputConvinados, SchemaFinal, 
         EstadoCajaInput, EstadoCajaSchema,
         LibroDiarioInput, LibroDiarioSchema,   
} from "../squemas/listaCajas";

import { DataEstadoResult, HistorialCaja, 
         DataResultMetodosPagos, CajasServicioResponse,
         ReturnUsuarioEscuelas,  MovimientoLibroDiario ,
         CajasResumenResponse, ArqueoCajaResumen, ArqueoDetalleItem      
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
 * Normaliza de forma defensiva el arqueo devuelto por la capa de datos.
 *
 * El JSON de `cajas.arqueo_detalle` puede venir `NULL` (caja abierta) o con
 * un tipo inesperado, y sus números pueden venir como string. Acá se deja
 * siempre un desglose válido (`[]` si no hay dato) y los montos como `number`.
 *
 * Los 2 usuarios (`usuario_apertura` / `usuario_cierre`) se **preservan** tal
 * como los resuelve el server (nombre y apellido → correo → "Sin usuario");
 * si vinieran vacíos, se les aplica el fallback `"Sin usuario"` (spec 042 ·
 * Ampliación 2 · A3).
 *
 * @param {ArqueoCajaResumen | undefined} arqueo - Arqueo crudo devuelto por la capa de datos.
 * @returns {ArqueoCajaResumen} El arqueo normalizado (con `detalle` siempre como array).
 */
const normalizarArqueoCaja = ( arqueo : ArqueoCajaResumen | undefined ) : ArqueoCajaResumen => {

    const detalleCrudo : unknown = arqueo?.detalle;

    const detalle : ArqueoDetalleItem[] = Array.isArray(detalleCrudo)
        ? detalleCrudo.map( ( item : Partial<ArqueoDetalleItem> ) => ({
                id_cuenta : Number(item?.id_cuenta) || 0,
                nombre_cuenta : typeof item?.nombre_cuenta === "string" ? item.nombre_cuenta : "",
                sistema : Number(item?.sistema) || 0,
                real : Number(item?.real) || 0
            }))
        : [];

    return {
        detalle,
        diferencia_total : Number(arqueo?.diferencia_total) || 0,
        monto_sistema : Number(arqueo?.monto_sistema) || 0,
        monto_final_real : Number(arqueo?.monto_final_real) || 0,
        usuario_apertura : typeof arqueo?.usuario_apertura === "string" && arqueo.usuario_apertura.trim() !== ""
            ? arqueo.usuario_apertura
            : "Sin usuario",
        usuario_cierre : typeof arqueo?.usuario_cierre === "string" && arqueo.usuario_cierre.trim() !== ""
            ? arqueo.usuario_cierre
            : "Sin usuario"
    };

};


/**
 * Valida los datos de entrada para el libro diario mediante un esquema Zod,
 * consulta en paralelo o secuencia los detalles de movimientos, el resumen de métodos de pago y
 * el arqueo por caja, y consolida los tres resultados en una respuesta unificada para el cliente.
 *
 * @async
 * @function libroDiario
 * @param {LibroDiarioInput} data - Objeto de entrada con el identificador de la caja (`id_caja`).
 * @throws {ZodError} Si la validación de los datos a través de `LibroDiarioSchema` falla.
 * @returns {Promise<TipadoData<CajasResumenResponse>>} Retorna una promesa con un objeto TipadoData:
 * - Si es exitoso o carece parcial/totalmente de registros (`error: false`): Devuelve un objeto consolidado 
 *   con `dataDetalle`, `dataMetodo` y `dataArqueo` bajo el código `"LISTADO_DETALLE_CAJA_OK"`.
 *   `dataArqueo` es `null` si la caja no existe o si la consulta del arqueo no devolvió el código esperado.
 * - Si ocurre un error inesperado a nivel de servidor (`error: true`): Retorna el código `"ERROR_SERVIDOR"`.
 */
    const libroDiario = async ( data : LibroDiarioInput )
    : Promise<TipadoData<CajasResumenResponse>> => {

        const dataValidada : LibroDiarioInput = LibroDiarioSchema.parse( data );

        const resultLibroDiario = await listaCajaData.libroDiarioDetalle( dataValidada );
        const resultMetodosPago = await listaCajaData.graficosMetodosPagoCaja(dataValidada);
        const resultArqueo = await listaCajaData.arqueoDetalleCaja(dataValidada);

        const sinDetalleCaja = resultLibroDiario.code === 'NO_ACTIVE_DETALLE_CAJA_RESUMEN';
        const sinMetodosPago = resultMetodosPago.code === "NO_ACTIVE_METODO_PAGOS_RESUMEN"

        // El hook `buscarExistenteEntidad` invierte la semántica: el código
        // "EXISTE" significa que la caja existe (y el dato viene en `data`).
        // Cualquier otro código (caja inexistente o error) => `dataArqueo = null`
        // sin cortar la respuesta del libro diario.
        const dataArqueo : ArqueoCajaResumen | null = resultArqueo.code === 'ARQUEO_DETALLE_CAJA_EXISTE'
            ? normalizarArqueoCaja( resultArqueo.data )
            : null;


        if ( 
            (resultLibroDiario.code === 'DETALLE_CAJA_RESUMEN_LISTED' || resultMetodosPago.code === "METODO_PAGOS_RESUMEN_LISTED") 
            || ( sinDetalleCaja || sinMetodosPago)
        ){

            const dataDetalle : MovimientoLibroDiario[] | null = sinDetalleCaja ? null : ( resultLibroDiario.data ??  null);
            const dataMetodo :  DataResultMetodosPagos[] | null  = sinMetodosPago ? null : ( resultMetodosPago.data ?? null);

            return {
                error : false, 
                message : "Libro diario listado correctamente.",
                data :  { dataDetalle , dataMetodo , dataArqueo },
                code : "LISTADO_DETALLE_CAJA_OK"
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

