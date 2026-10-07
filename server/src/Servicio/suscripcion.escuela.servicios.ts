import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataSuscripcion }  from "../data/suscripcion.escuela.data";
import { method as dataPlanesSaas } from "../data/planes.saas.data";
import {
    SuscripcionInputs, SuscripcionSchema,
    filtrosSuscripcionesSchema, FiltrosSuscripcionesInputs, FiltrosSuscripciones,
    AnularSuscripcionSchema, AnularSuscripcionInputs
 } from "../squemas/suscripciones.escuela";
import { TipadoData } from "../tipados/tipado.data";
import { SuscripcionEscuelaDto, EscuelaSelect, SuscripcionDatos, SuscripcionEstadoDto, MetricasSimples } from "../data/suscripcion.escuela.data";
import { PlanSaasRow } from "../data/planes.saas.data";



const postSuscripcion = async ( data : SuscripcionInputs)
:Promise<TipadoData<SuscripcionDatos>> =>{

    const dataValidada : SuscripcionInputs = SuscripcionSchema.parse( data );

    const verificarSuspcripcion = await  dataSuscripcion.verificarSuscripcion( dataValidada.id_escuela );

    if ( verificarSuspcripcion.code === 'SUSPCRIPCION_NO_EXISTE'){

        const resultSuscripcion = await dataSuscripcion.postSuscripcion(data);
        
        if ( resultSuscripcion.code === 'SUSCRIPCION_CREAR' ){
            return {
                error : false,
                message : "Suscripcion creada con exito.",
                data : resultSuscripcion.data,
                code : "SUSCRIPCION_OK"
            };
        };
    };

    if ( verificarSuspcripcion.code === 'SUSPCRIPCION_EXISTE'){
        return {
            error : true, 
            message : "Esta escuela ya cuenta con una Suscripcion.",
            code : "SUSCRIPCION_ACTIVA"
        };
    };


    return{
        error : true, 
        message : "Error en el servidor , post suscripcion.",
        code : "ERROR_SERVIDOR"
    };  
};


const getSuspcripciones = async ( data : FiltrosSuscripcionesInputs  )
:Promise<TipadoData<SuscripcionEscuelaDto[]>> =>{

    const validarSusp : FiltrosSuscripciones = filtrosSuscripcionesSchema.parse(data);
    const { pagina, limit} = validarSusp
    const offset = ( pagina -1 ) * Number(limit) ;  

    const info = {
        ...validarSusp, offset : offset
    }

    const resultGetListado = await dataSuscripcion.getSuscripciones(info, String(validarSusp.pagina));
        
    if ( resultGetListado.code === 'LISTADO_SUSP_LISTED' ){
        return {
            error: false,
            message : "Listado de susp. ok.",
             data : resultGetListado.data,
             paginacion : resultGetListado.paginacion,
             code : "LISTADO_SUSP_OK"
        };
    };

    if ( resultGetListado.code === 'NO_ACTIVE_LISTADO_SUSP' ){
        return {
            error: true ,
            message : "Sin listado de susp.",
            code : "LISTADO_SUSP_EMPY"
        };
    };    
    
    return{
        error : true, 
        message : "Error en el servidor , get suscripcion.",
        code : "ERROR_SERVIDOR"
    }; 
}

/** Respuesta del combo del formulario de suscripciones: dos arreglos (escuelas y planes SaaS) */
export interface EscPlanDTO {
    escuelas: EscuelaSelect[];
    planes_saas: Pick<PlanSaasRow, "id_plan" | "descripcion">[];
};

/**
 * Devuelve en una sola respuesta los dos arreglos que necesita el formulario
 * de suscripciones: escuelas activas (id + razón social) y planes SaaS activos
 * (id + descripción). No recibe filtros, por lo que no hay schema que validar.
 *
 * Reglas:
 * - Si ambas capas data respondieron con un código conocido:
 *   `ESC_PLAN_EMPTY` (422) solo cuando los dos arreglos vienen vacíos,
 *   o `ESC_PLAN_OK` (200) con al menos uno de los dos listados.
 * - Si alguna devolvió un código no previsto → `ERROR_SERVIDOR` (retorno por defecto).
 *
 * @param _data - Sin uso: se mantiene para respetar la firma que espera `handleControladores`.
 * @returns Promise<TipadoData<EscPlanDTO>> con ambos arreglos.
 */
const getEscPlan = async ( _data : {} )
:Promise<TipadoData<EscPlanDTO>> =>{

    const [escuelasResult, planesResult] = await Promise.all([
        dataSuscripcion.listarEscuelasSelect(),
        dataPlanesSaas.listaPlanesSaas({ estado : "activo" })
    ]);

    const escuelasListadas = escuelasResult.code === "ESCUELA_SELECT_LISTED";
    const escuelasVacias   = escuelasResult.code === "NO_ACTIVE_ESCUELA_SELECT";
    const planesListados   = planesResult.code   === "PLANES_SAAS_LISTED";
    const planesVacios     = planesResult.code   === "NO_ACTIVE_PLANES_SAAS";

    // Ambas capas data respondieron con un código conocido
    if ( ( escuelasListadas || escuelasVacias ) && ( planesListados || planesVacios ) ){

        if ( !escuelasListadas && !planesListados ){
            return {
                error : true,
                message : "Sin escuelas ni planes.",
                code : "ESC_PLAN_EMPTY"
            };
        };

        return {
            error : false,
            message : "Listado de escuelas y planes ok.",
            data : {
                escuelas : escuelasListadas ? escuelasResult.data ?? [] : [],
                planes_saas : planesListados
                    ? ( planesResult.data ?? [] ).map( plan => ({
                          id_plan : plan.id_plan,
                          descripcion : plan.descripcion
                      }))
                    : []
            },
            code : "ESC_PLAN_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return{
        error : true,
        message : "Error en el servidor , get esc plan.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Anula una suscripción: pasa su estado a "anulado" (acción única de esta ruta).
 *
 * Reglas:
 * - `SUSCRIPCION_MODIFICAR` (la data afectó 1 fila) → `SUSCRIPCION_ANULAR_OK` (200).
 * - Si la suscripción no existe (0 filas), `iudEntidad` lanza ClientError 404 `MODIFICAR_NOT_FOUND`.
 * - Si la data devuelve un código no previsto → `ERROR_SERVIDOR` (retorno por defecto).
 *
 * @param data - Entrada validada con `AnularSuscripcionSchema` (id_suscripcion).
 * @returns Promise<TipadoData<SuscripcionEstadoDto>> con la suscripción y su nuevo estado.
 */
const anularSuscripcion = async ( data : AnularSuscripcionInputs )
:Promise<TipadoData<SuscripcionEstadoDto>> =>{

    const validarData : AnularSuscripcionInputs = AnularSuscripcionSchema.parse( data );

    const resultAnular = await dataSuscripcion.anularSuscripcion({
        id_suscripcion : validarData.id_suscripcion,
        estado : "c"
    });

    if ( resultAnular.code === "SUSCRIPCION_MODIFICAR" ){
        return {
            error : false,
            message : "Suscripcion anulada con exito.",
            data : resultAnular.data,
            code : "SUSCRIPCION_ANULAR_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return{
        error : true,
        message : "Error en el servidor , anular suscripcion.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Devuelve las métricas simples del administrador (alcance global), todas sobre
 * `suscripciones_escuelas`: suscripciones por vencer en los próximos 7 días,
 * suscripciones vencidas, suma de los precios de las suscripciones del mes en curso
 * (sin anuladas) y suscripciones vigentes. No recibe filtros, no hay schema que validar.
 *
 * @param _data - Sin uso: se mantiene para respetar la firma que espera `handleControladores`.
 * @returns {Promise<TipadoData<MetricasSimples>>} Las 4 métricas en `data`, o el error asociado.
 */
const metricasSimples = async ( _data : {} )
:Promise<TipadoData<MetricasSimples>> =>{

    const resultMetricas = await dataSuscripcion.metricasSimples();

    if ( resultMetricas.code === 'METRICAS_SIMPLES_EXISTE' ){
        // mysql2 devuelve DECIMAL/BIGINT como string: normalizamos a number (la interface lo promete)
        const metricas : MetricasSimples = {
            suscripciones_por_vencer : Number( resultMetricas.data?.suscripciones_por_vencer ?? 0 ),
            suscripciones_vencidas   : Number( resultMetricas.data?.suscripciones_vencidas ?? 0 ),
            total_mes                : Number( resultMetricas.data?.total_mes ?? 0 ),
            suscripciones_vigentes   : Number( resultMetricas.data?.suscripciones_vigentes ?? 0 )
        };

        return {
            error : false,
            message : "Metricas simples ok.",
            data : metricas,
            code : "METRICAS_SIMPLES_OK"
        };
    };

    if ( resultMetricas.code === 'METRICAS_SIMPLES_NO_EXISTE' ){
        return {
            error : true,
            message : "Sin metricas simples.",
            code : "SIN_METRICAS_SIMPLES"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , metricas simples.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
    postSuscripcion : tryCatchDatos(  postSuscripcion ),
    getSuspcripciones : tryCatchDatos( getSuspcripciones ),
    getEscPlan : tryCatchDatos( getEscPlan ),
    anularSuscripcion : tryCatchDatos( anularSuscripcion ),
    metricasSimples : tryCatchDatos( metricasSimples )
};