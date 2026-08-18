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
 * Obtiene y consolida las métricas de inscripciones, vencimientos y el balance de caja 
 * para una escuela específica. Si la caja está cerrada, permite que las demás métricas 
 * se muestren correctamente asignando un valor por defecto a la caja.
 *
 * @async
 * @function metricasInscripcion
 * @param {MetricaInputs} data - Objeto de entrada con los datos necesarios (ej. id_escuela).
 * @throws {ZodError} Si la validación de los datos de entrada a través de `MetricasSchema` falla.
 * @returns {Promise<TipadoData<ResultTarjetas>>} Retorna una promesa con un objeto de tipo TipadoData:
 * - Si es exitoso (`error: false`): Devuelve las métricas consolidadas en `data` con código `"METRICAS_OK"`.
 * - Si falla alguna validación o hay un error en el servidor: Devuelve `error: true` con su respectivo mensaje y código 
 *   (ej. `"SIN_METRICAS_INSCRIPCIONES"`, `"SIN_METRICAS_VENCIMIENTOS"`, `"ERROR_SERVIDOR"`).
 */
const metricasInscripcion = async ( data : MetricaInputs ) : Promise<TipadoData<ResultTarjetas>> => {

    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
 
    // 1. Consultamos TODAS las fuentes en paralelo o secuencial sin cortar antes de tiempo
    const resultIdCaja = await dataCaja.idCajaAbierta( validarInfo );

    const metricaTotalCaja = resultIdCaja.code !== 'ID_CAJA_NO_EXISTE' && resultIdCaja.data?.id_caja 
        ? await dataCaja.metricasPrincipal({
            id_caja : resultIdCaja.data.id_caja,
            id_escuela : validarInfo.id_escuela
          })
        : null;

    const resulMetricas = await dataMetricas.metricasInsc( validarInfo.id_escuela );
    const resultVencimientos = await dataMetricas.metricasVencimientos( validarInfo.id_escuela );


    // 2. Manejamos los errores específicos si es necesario, o armamos un valor por defecto si la caja está cerrada
    const totalCajaValor = (metricaTotalCaja && metricaTotalCaja.code === 'METRICAS_PANEL_LISTED' && Array.isArray(metricaTotalCaja.data))
        ? Number(metricaTotalCaja.data[0].balance_neto)
        : 0; // Si no hay caja abierta, la caja arranca en 0 pero las demás métricas se muestran igual


    // 3. Validamos que al menos las métricas principales (inscripciones y vencimientos) estén OK
    if ( 
        resulMetricas.code === 'METRICAS_INSCRIPCIONES_EXISTE' &&
        resultVencimientos.code === 'METRICAS_VENCIMIENTOS_EXISTE'
    ){

        const result = {
             total_activos: resulMetricas.data?.total_activos || 0 ,
             nuevos_este_mes: Number(resulMetricas.data?.nuevos_este_mes ),
             porcentaje_nuevos: Number( resulMetricas.data?.porcentaje_nuevos ),
             
             vencen_proximos: Number( resultVencimientos.data?.vencen_proximos), 
             vencidos_este_mes: Number( resultVencimientos.data?.vencidos_este_mes ) ,
            
             total_caja : totalCajaValor // Si no había caja, mandará 0 o lo que prefieras mostrar
        };

        return{
            error: false,
            message : "Metricas inscripciones ok.",
            data : result,
            code : "METRICAS_OK"
        };
    };    

    // Manejo de errores si fallan las otras métricas
    if (resulMetricas.code === 'METRICAS_INSCRIPCIONES_NO_EXISTE') {
        return { error: true, message: "Sin metricas, inscripcion.", code: "SIN_METRICAS_INSCRIPCIONES" };
    }

    if (resultVencimientos.code === 'METRICAS_VENCIMIENTOS_NO_EXISTE') {
        return { error: true, message: "Sin metricas, vencimientos.", code: "SIN_METRICAS_VENCIMIENTOS" };
    }

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