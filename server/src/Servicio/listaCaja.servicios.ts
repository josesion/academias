import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as listaCajaData} from "../data/listaCajas.data";

import { TipadoData } from "../tipados/tipado.data";
import { InputConvinados, SchemaFinal } from "../squemas/listaCajas";
import { DataEstadoResult, HistorialCaja, DataResultMetodosPagos, CajasServicioResponse } from "../data/listaCajas.data";



/**
 * Servicio centralizado que procesa y unifica la información de cajas de una escuela.
 * Ejecuta validaciones mediante Zod y recupera de forma concurrente o secuencial 
 * el estado actual de la caja abierta, el historial paginado de cajas cerradas 
 * y las métricas por método de pago.
 *
 * @async
 * @function listaCajasServicio
 * @param {InputConvinados} data - Objeto con los parámetros de entrada y filtros necesarios (id_escuela, fechas, paginación, etc.).
 * 
 * @returns {Promise<TipadoData<{}>>} Promesa que resuelve con un objeto estructurado que contiene:
 *          - `dataEstado`: Datos de la caja abierta o null si no existe.
 *          - `dataDetalle`: Listado del historial de cajas cerradas o null si no hay registros.
 *          - `dataMetodo`: Métricas de pagos agrupadas por cuenta o null si no hay datos.
 *          Incluye también la paginación correspondiente al historial y los códigos de éxito o error.
 * 
 * @throws {ZodError} Lanza un error si los datos de entrada no cumplen con la validación de `SchemaFinal`.
 * 
 * @example
 * const respuesta = await listaCajasServicio({
 *     id_escuela: 1,
 *     fechaDesde: '2026-04-01',
 *     fechaHasta: '2026-04-30',
 *     idUsuarioFiltro: null,
 *     estadoDiferencia: null,
 *     limit: 10,
 *     pagina: 1
 * });
 */
const listaCajasServicio = async ( data : InputConvinados)
: Promise<TipadoData<CajasServicioResponse>> =>{

    const dataValidada : InputConvinados = SchemaFinal.parse( data );
   // console.log(dataValidada)

    const resultEstadoCaja = await listaCajaData.listaEstadoCaja(dataValidada);
    const resultHistorialCajas = await listaCajaData.detalleCajasCerradas( dataValidada );
    const resultMetodosPago = await listaCajaData.metricasMetodoPagoCajas( dataValidada);

    const sinCaja = resultEstadoCaja.code === 'ESTADO_CAJA_NO_EXISTE';
    const sinDetalle = resultHistorialCajas.code === 'NO_ACTIVE_HISTORIAL_CAJAS';   
    const sinMetodos = resultMetodosPago.code === 'NO_ACTIVE_METODOS_DATOS'

 
    if( (resultEstadoCaja.code === 'ESTADO_CAJA_EXISTE' && resultHistorialCajas.code === 'HISTORIAL_CAJAS_CERRADAS') 
       || ( sinCaja || sinDetalle || sinMetodos) ){

        const dataEstado: DataEstadoResult | null = sinCaja    ? null : (resultEstadoCaja.data ?? null);
        const dataDetalle : HistorialCaja[] | null  = sinDetalle ? null : (resultHistorialCajas.data ?? null);
        const dataMetodo  : DataResultMetodosPagos[] | null = sinMetodos ? null : (resultMetodosPago.data ?? null );


        return{
            error : false,
            message : "Tareas realizadas con exito.",
            data : {
                dataEstado, dataDetalle , dataMetodo
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

export const method = {
    listaCajasServicio : tryCatchDatos( listaCajasServicio),
};

