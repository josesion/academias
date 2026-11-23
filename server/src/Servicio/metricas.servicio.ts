import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataMetricas } from  "../data/metricas.data";
import { method as dataCaja } from "../data/caja.data";

import { TipadoData } from "../tipados/tipado.data";
import { ResultClase , ReultTarjetasInscripcion, ReultTarjetasVencimientos,
         ResultAsistencia, VencimientoEscuela, ResultClaseConAsistencia
} from "../data/metricas.data";
import { MetricaInputs,MetricasSchema, IdEscuelaInputs, IdEscuelaSchema } from "../squemas/metricas";



export  interface ResultTarjetas extends ReultTarjetasInscripcion, ReultTarjetasVencimientos{            
    total_caja?: number,
    porcentaje_activos?: number,
    porcentaje_nuevos_real?: number,
    porcentaje_vencen_proximos?: number,
    porcentaje_vencidos?: number,
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

    let totalCajaValor;

    if ( validarInfo.tipo != "basico" ){

        const metricaTotalCaja = resultIdCaja.code !== 'ID_CAJA_NO_EXISTE' && resultIdCaja.data?.id_caja 
            ? await dataCaja.metricasPrincipal({
                id_caja : resultIdCaja.data.id_caja,
                id_escuela : validarInfo.id_escuela
            })
            : null;

        // 2. Manejamos los errores específicos si es necesario, o armamos un valor por defecto si la caja está cerrada
        totalCajaValor = (metricaTotalCaja && metricaTotalCaja.code === 'METRICAS_PANEL_LISTED' && Array.isArray(metricaTotalCaja.data))
            ? Number(metricaTotalCaja.data[0].balance_neto)
            : 0; // Si no hay caja abierta, la caja arranca en 0 pero las demás métricas se muestran igual    

    };

    const resulMetricas = await dataMetricas.metricasInsc( validarInfo.id_escuela );
    const resultVencimientos = await dataMetricas.metricasVencimientos( validarInfo.id_escuela );

    // Consultas del mes anterior para calcular variación
    const resulMetricasMesAnterior = await dataMetricas.metricasInscMesAnterior( validarInfo.id_escuela );
    const resultVencimientosMesAnterior = await dataMetricas.metricasVencimientosMesAnterior( validarInfo.id_escuela );

    // Función auxiliar para calcular porcentaje de variación
    const calcularPorcentaje = (actual: number, anterior: number): number | undefined => {
        if (actual === 0 && anterior === 0) return undefined;
        if (anterior === 0) return 100;
        return Math.round(((actual - anterior) / anterior) * 10000) / 100;
    };

    // 3. Validamos que al menos las métricas principales (inscripciones y vencimientos) estén OK
    if (
        resulMetricas.code === 'METRICAS_INSCRIPCIONES_EXISTE' &&
        resultVencimientos.code === 'METRICAS_VENCIMIENTOS_EXISTE'
    ){

        const totalActivos = resulMetricas.data?.total_activos || 0;
        const nuevosEsteMes = Number(resulMetricas.data?.nuevos_este_mes);
        const vencenProximos = Number(resultVencimientos.data?.vencen_proximos);
        const vencidosEsteMes = Number(resultVencimientos.data?.vencidos_este_mes);

        const activosMesAnterior = Number(resulMetricasMesAnterior.data?.total_activos ?? 0);
        const nuevosMesAnterior = Number(resulMetricasMesAnterior.data?.nuevos_este_mes ?? 0);
        const vencenProximosMesAnterior = Number(resultVencimientosMesAnterior.data?.vencen_proximos ?? 0);
        const vencidosMesAnterior = Number(resultVencimientosMesAnterior.data?.vencidos_este_mes ?? 0);

        const result = {
             total_activos: totalActivos,
             nuevos_este_mes: nuevosEsteMes,
             porcentaje_nuevos: Number( resulMetricas.data?.porcentaje_nuevos ),
             
             vencen_proximos: vencenProximos,
             vencidos_este_mes: vencidosEsteMes,
             
             porcentaje_activos: calcularPorcentaje(totalActivos, activosMesAnterior),
             porcentaje_nuevos_real: calcularPorcentaje(nuevosEsteMes, nuevosMesAnterior),
             porcentaje_vencen_proximos: calcularPorcentaje(vencenProximos, vencenProximosMesAnterior),
             porcentaje_vencidos: calcularPorcentaje(vencidosEsteMes, vencidosMesAnterior),
             
             ...(validarInfo.tipo !== "basico" && { total_caja: totalCajaValor })
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
 * Procesa la obtención de los datos del encabezado de TODAS las clases en curso.
 * * Valida los datos de entrada usando un esquema de Zod, interactúa con la capa 
 * de persistencia (`dataMetricas`) y transforma los códigos de respuesta internos 
 * en una estructura estandarizada para la UI.
 * * Ahora devuelve un array con todas las clases activas, incluyendo las de
 * diferentes salas, para que la UI pueda mostrar cada una por separado.
 * * @param {MetricaInputs} data - Objeto que contiene el `id_escuela` necesario para la consulta.
 * * @returns {Promise<TipadoData<ResultClase[]>>} Una promesa que resuelve con un objeto de resultado 
 * que indica si la operación fue exitosa, contiene el array de clases en curso, o reporta un error.
 * * @throws {ZodError} Si los datos de entrada (`data`) no cumplen con el `MetricasSchema`.
 */
const encabezadoClases = async( data : MetricaInputs )
:Promise<TipadoData<ResultClase[]>> =>{

    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
    const resultClases = await dataMetricas.encabezadoClases( validarInfo.id_escuela );

    if ( resultClases.code === 'NO_ACTIVE_ENCABEZADO_CLASES'  ){
        return{
            error : true, 
            message : "Sin datos de clase actual.",
            code : "SIN_METRICAS_CLASES"
        };
    };
    if ( resultClases.code === 'ENCABEZADO_CLASES_LISTED'  ){
        return {
            error : false,
            message : "Encabezado de las clases correcto.",
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
 * Orquesta la obtención del listado de asistencia para TODAS las clases en curso.
 * * Primero identifica todas las clases activas mediante el `id_escuela`, y si existen, 
 * procede a consultar las asistencias registradas para todos los horarios encontrados.
 * * Agrupa los alumnos por su clase (id_horario_clase) para que el frontend pueda
 * mostrar cada clase con sus propios alumnos en un acordeón.
 * * @param {MetricaInputs} data - Objeto que contiene el `id_escuela` validado para la consulta.
 * * @returns {Promise<TipadoData<ResultClaseConAsistencia[]>>} Una promesa que resuelve con un array
 * donde cada elemento contiene la info de la clase y sus alumnos, o un error.
 * * @throws {ZodError} Si la validación de `data` falla según `MetricasSchema`.
 */
const asistenciaClases = async ( data : MetricaInputs )
:Promise<TipadoData< ResultClaseConAsistencia[]>> =>{
    
    const validarInfo : MetricaInputs = MetricasSchema.parse( data ); 
    const clasesResult = await dataMetricas.encabezadoClases( validarInfo.id_escuela );
    
    if ( clasesResult.code === 'NO_ACTIVE_ENCABEZADO_CLASES'  ){
        return{
            error : true, 
            message : "Sin datos de clase actual.",
            code : "SIN_HORARIO_CLASES"
        };
    };

    if ( clasesResult.code !== 'ENCABEZADO_CLASES_LISTED' || !clasesResult.data || clasesResult.data.length === 0 ) {
        return { error: true, message: "No se pudo obtener el listado de clases.", code: "ERROR_DATOS" };
    };

    // Extraer todos los IDs de horario de las clases en curso
    const id_horarios = clasesResult.data.map( c => c.id_clase );

    const asistenciaResult = await dataMetricas.asistenciaClases( id_horarios );

    // Agrupar alumnos por id_horario_clase
    const alumnosPorClase = new Map<number, ResultAsistencia[]>();
    if ( asistenciaResult.code === 'ASISTENCIAS_LISTED' && asistenciaResult.data ) {
        for ( const alumno of asistenciaResult.data ) {
            const id = alumno.id_horario_clase;
            if ( !alumnosPorClase.has(id) ) {
                alumnosPorClase.set(id, []);
            }
            alumnosPorClase.get(id)!.push(alumno);
        }
    }

    // Construir el array de clases con sus alumnos
    const clasesConAsistencia: ResultClaseConAsistencia[] = clasesResult.data.map( clase => ({
        id_clase: clase.id_clase,
        nombre_clase: clase.nombre_clase,
        horario: clase.horario,
        nombre_profesor: clase.nombre_profesor,
        sala: clase.sala,
        alumnos: alumnosPorClase.get(clase.id_clase) || []
    }));

    return {
        error : false,
        message : "Listado de asistencia por clase.",
        data : clasesConAsistencia,
        code : "ASISTENCIA_OK"
    };
};


const fechaVencimietno = async ( data : IdEscuelaInputs)
:Promise<TipadoData<VencimientoEscuela>> =>{

    const validarData : IdEscuelaInputs = IdEscuelaSchema.parse( data );

    const resultFecha = await  dataMetricas.fechaVencimiento( validarData.id_escuela );


    if ( resultFecha.code ===  'FECHA_VENCIMIENTO_EXISTE'){
        return {
            error : false,
            message : "Se encontro fecha de vencimietno.",
            data : resultFecha.data,
            code : "FECHA_VENCIMIENO_OK"
        };
    };

    if ( resultFecha.code ===  'FECHA_VENCIMIENTO_NO_EXISTE'){
       return {
         error : true, 
         message : "No se encontro ninguna fecha de vencimiento.",
         code : "SIN_FECHA_VENCIMIENTO"    
       }; 
    };    

    return {
        error : true,
        message : "Error en el servidor , fecha Vencimiento.",
        code : "ERROR_SERVIDOR"
    };    
};

export const method = {
    metricasInscripcion : tryCatchDatos( metricasInscripcion),
    encabezadoClases    : tryCatchDatos( encabezadoClases ),
    asistenciaClases    : tryCatchDatos( asistenciaClases ),
    fechaVencimietno : tryCatchDatos(fechaVencimietno)
};