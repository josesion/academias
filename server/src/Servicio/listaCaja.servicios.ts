import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as listaCajaData} from "../data/listaCajas.data";

import { TipadoData } from "../tipados/tipado.data";
import { InputConvinados, SchemaFinal, EstadoCajaInput, EstadoCajaSchema } from "../squemas/listaCajas";
import { DataEstadoResult, HistorialCaja, DataResultMetodosPagos, CajasServicioResponse } from "../data/listaCajas.data";



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

export const method = {
    estadoCaja : tryCatchDatos(encabezadoHistorialCajaServicio),
    listaCajasServicio : tryCatchDatos( listaCajasServicio),
};

