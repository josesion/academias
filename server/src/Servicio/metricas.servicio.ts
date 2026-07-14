import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataMetricas } from  "../data/metricas.data";
import { method as dataCaja } from "../data/caja.data";

import { TipadoData } from "../tipados/tipado.data";
import { ResultClase , ReultTarjetasInscripcion, ReultTarjetasVencimientos,  ResultAsistencia } from "../data/metricas.data";
import { MetricaInputs,MetricasSchema } from "../squemas/metricas";



export  interface ResultTarjetas extends ReultTarjetasInscripcion, ReultTarjetasVencimientos{            
    total_caja : number,
};

/**
 * Orquesta la obtención y consolidación de métricas generales para el panel de control.
 * Valida la existencia de una caja abierta, obtiene métricas de inscripciones, 
 * estados de vencimientos y el balance financiero actual.
 *
 * @async
 * @function metricasInscripcion
 * @param {Object} data - Objeto con los datos de entrada.
 * @param {number} data.id_escuela - Identificador de la escuela para filtrar las métricas.
 * @returns {Promise<{error: boolean, message: string, code: string, data?: Object}>} 
 * Retorna un objeto con las métricas consolidadas si todo es correcto, 
 * o un objeto de error en caso de fallo en la validación o en la consulta a la BD.
 * * @throws {Error} Si la validación con `MetricasSchema` falla.
 * * @example
 * const resultado = await metricasInscripcion({ id_escuela: 107 });
 * if (!resultado.error) {
 * console.log("Métricas obtenidas:", resultado.data);
 * }
 */
const metricasInscripcion = async ( data : MetricaInputs )
:Promise<TipadoData<ResultTarjetas>> => {

    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
 
    
    const resultIdCaja = await dataCaja.idCajaAbierta( validarInfo );


    if ( resultIdCaja.code ==='ID_CAJA_NO_EXISTE'){
        return{
            error : true, 
            message : "Sin caja. Abra una antes por favor.",
            code : "SIN_CAJA_ABIERTA"
        };
    };

    const metricaTotalCaja = await dataCaja.metricasPrincipal({
        id_caja : resultIdCaja.data?.id_caja,
        id_escuela : validarInfo.id_escuela
    });

    if ( metricaTotalCaja.code === 'NO_ACTIVE_METRICAS_PANEL'){
        return{
            error : true, 
            message : "Sin metricas, Balance total.",
            code : "SIN_METRICAS_CAJA"
        };
    };


    const resulMetricas = await dataMetricas.metricasInsc( validarInfo.id_escuela );
    //console.log(resulMetricas)

    if ( resulMetricas.code === 'METRICAS_INSCRIPCIONES_NO_EXISTE'){
        return{
            error : true, 
            message : "Sin metricas, inscripcion.",
            code : "SIN_METRICAS_INSCRIPCIONES"
        };
    };

    const resultVencimientos = await dataMetricas.metricasVencimientos( validarInfo.id_escuela );
  //  console.log(resultVencimientos)

    if ( resultVencimientos.code === 'METRICAS_VENCIMIENTOS_NO_EXISTE'){
        return{
            error : true, 
            message : "Sin metricas, inscripcion.",
            code : "SIN_METRICAS_VENCIMIENTOS"
        };
    };


// todo ok 
    if ( 
        resulMetricas.code === 'METRICAS_INSCRIPCIONES_EXISTE' &&
        resultVencimientos.code === 'METRICAS_VENCIMIENTOS_EXISTE' &&
        metricaTotalCaja.code === 'METRICAS_PANEL_LISTED' &&  Array.isArray(metricaTotalCaja.data) 
    ){

        const result = {
             total_activos: resulMetricas.data?.total_activos || 0 ,
             nuevos_este_mes: Number(resulMetricas.data?.nuevos_este_mes ),
             porcentaje_nuevos: Number( resulMetricas.data?.porcentaje_nuevos ),
             
             vencen_proximos: Number( resultVencimientos.data?.vencen_proximos), 
             vencidos_este_mes: Number( resultVencimientos.data?.vencidos_este_mes ) ,
            
             total_caja : Number(metricaTotalCaja.data[0].balance_neto )
        };


        return{
            error: false,
            message : "Metricas inscripciones ok.",
            data : result,
            code : "METRICAS_OK"
        };
    };    


    return {
        error : true, 
        message : "Error en el servidor, metricas.",
        code : "ERROR_SERVIDOR"
    };

};



/**
 * Procesa la obtención de los datos del encabezado de la clase actual.
 * * Valida los datos de entrada usando un esquema de Zod, interactúa con la capa 
 * de persistencia (`dataMetricas`) y transforma los códigos de respuesta internos 
 * en una estructura estandarizada para la UI.
 * * @param {MetricaInputs} data - Objeto que contiene el `id_escuela` necesario para la consulta.
 * * @returns {Promise<TipadoData<ResultClase>>} Una promesa que resuelve con un objeto de resultado 
 * que indica si la operación fue exitosa, contiene los datos de la clase, o reporta un error específico 
 * (servidor o ausencia de clases activas).
 * * @throws {ZodError} Si los datos de entrada (`data`) no cumplen con el `MetricasSchema`.
 */
const encabezadoClases = async( data : MetricaInputs )
:Promise<TipadoData<ResultClase>> =>{

    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
    const resultClases = await dataMetricas.encabezadoClases( validarInfo.id_escuela );

    if ( resultClases.code === 'METRICAS_ENCABEZADO_CLASES_NO_EXISTE'  ){
        return{
            error : true, 
            message : "Sin datos de clase actual.",
            code : "SIN_METRICAS_CLASES"
        };
    };
    if ( resultClases.code === 'METRICAS_ENCABEZADO_CLASES_EXISTE'  ){
        return {
            error : false,
            message : "Encabezado de las clase la correcto.",
            data : resultClases.data,
            code : "CLASES_OK"
        };
    };

    return {
        error : true,
        message : "Error en el servidor , clases encabezado.",
        code : "ERROR_SERVIDOR"
    };
};



/**
 * Orquesta la obtención del listado de asistencia para la clase que está ocurriendo actualmente.
 * * Primero identifica la clase activa mediante el `id_escuela`, y si existe, 
 * procede a consultar las asistencias registradas para ese horario específico.
 * * @param {MetricaInputs} data - Objeto que contiene el `id_escuela` validado para la consulta.
 * * @returns {Promise<TipadoData<any>>} Una promesa que resuelve con el listado de alumnos 
 * asistentes si la operación fue exitosa, o un objeto con el error correspondiente 
 * (sin clase activa, sin alumnos encontrados o error de servidor).
 * * @throws {ZodError} Si la validación de `data` falla según `MetricasSchema`.
 */
const asistenciaClases = async ( data : MetricaInputs )
:Promise<TipadoData< ResultAsistencia[]>> =>{
    
    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
    const idHorario = await dataMetricas.encabezadoClases( validarInfo.id_escuela );
    
    if ( idHorario.code === 'METRICAS_ENCABEZADO_CLASES_NO_EXISTE'  ){
        return{
            error : true, 
            message : "Sin datos de clase actual.",
            code : "SIN_HORARIO_CLASES"
        };
    };

    const id_horario = idHorario.data?.id_clase;

    if (!id_horario) {
        return { error: true, message: "No se pudo obtener el ID de la clase.", code: "ERROR_DATOS" };
    }

    const asitenciaResult = await dataMetricas.asistenciaClases( id_horario );
   

    if ( asitenciaResult.code === 'NO_ACTIVE_ASISTENCIAS'  ){
        return{
            error : true, 
            message : "No se encontraron alumnos en esta clase.",
            code : "SIN_ALUMNOS_ASISTENCIA"
        };
    };

    if ( asitenciaResult.code === 'ASISTENCIAS_LISTED'  ){
        return {
            error : false,
            message : "Listado de asistencia.",
            data : asitenciaResult.data,
            code : "ASISTENCIA_OK"
        };
    };

    return {
        error : true,
        message : "Error en el servidor , listado de asistencia.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
    metricasInscripcion : tryCatchDatos( metricasInscripcion),
    encabezadoClases    : tryCatchDatos( encabezadoClases ),
    asistenciaClases    : tryCatchDatos( asistenciaClases ),
};