
import { method as dataCaja} from "../data/caja.data";
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";

// ──────────────────────────────────────────────────────────────
// Sección de  typados
// ──────────────────────────────────────────────────────────────
import { VerificarCajaInputs, VerificarCajaSchema,
         AbrirCajaInputs , AbrirCajaSchema,
         DetalleCajaInputs ,DetalleCajaSchema,
         CierreCajaInputs, CierreCajaSchema,
         IdCajaAbiertaInputs, IdCajaAbiertaSchema,
         PanelMetricasInputs, PanelMetricasSchema,
 } from "../squemas/cajas"; 
import { TipadoData } from "../tipados/tipado.data";
import { DataAltaCaja , DataAltaCajaResult, ResultDetalleCaja, MetricaPanelPrincipal } from "../tipados/caja.data.tipado"; 


/**
 * Controlador orquestador para el proceso de apertura de caja.
 * * @async
 * @param {DataAltaCaja} data - Objeto con los datos de entrada (id_escuela, monto_inicial, etc.).
 * @returns {Promise<TipadoData<DataAltaCaja>>} Objeto de respuesta estandarizado que contiene:
 * - error: boolean indicando si falló la operación.
 * - message: descripción del resultado para el usuario.
 * - code: código único para lógica del frontend (ej: 'CAJA_ABIERTA_OK').
 * - data: (opcional) los datos de la caja creada.
 * * @description
 * El flujo consiste en:
 * 1. Validar y filtrar datos para la verificación.
 * 2. Comprobar mediante `verificarCajaAbierta` si ya existe una sesión activa.
 * 3. Validar y filtrar datos para la inserción.
 * 4. Ejecutar la apertura mediante `abrirCaja`.
 */
const abrirCaja = async( data : DataAltaCaja) 
: Promise<TipadoData<DataAltaCajaResult>>=>{
    const verificar : VerificarCajaInputs = VerificarCajaSchema.parse(data);
    const vericarResult = await dataCaja.verificarCajaAbierta(verificar);
    
    if ( vericarResult.code === "CAJA_ABIERTA_EXISTE"){
       return {
          error : true,
          message : "La caja se encuentra abierta",
          code : "CAJA_ABIERTA"          
       }
    };
    
    const abrirCajaData : AbrirCajaInputs = AbrirCajaSchema.parse( data );
    const abrirCajaResult = await dataCaja.abrirCaja(abrirCajaData);

    if ( abrirCajaResult.code === "ABRIR_CAJA_CREAR"){
        return {
            error : false,
            message : "Caja Abierta exsitosamente",
            data    : abrirCajaResult.data,
            code    : "CAJA_ABIERTA_OK"
        };
    };

    return {
        error : true,
        message : "No se pudo completar la apertura de caja",
        code : "ERROR_ABRIR_CAJA"
    };

};

/**
* Orquesta la creación de un movimiento en el detalle de caja.
 * * Esta función realiza tres pasos críticos:
 * 1. Valida los datos de entrada contra el esquema `DetalleCajaSchema` (Zod).
 * 2. Llama al acceso a datos para persistir el registro.
 * 3. Normaliza la respuesta para el frontend, filtrando solo los IDs necesarios.
 * * @async
 * @param {DetalleCajaInputs} data - Objeto con los datos crudos del movimiento.
 * @returns {Promise<TipadoData<ResultDetalleCaja>>} 
 * - Si es exitoso: `error: false`, mensaje de confirmación y IDs del movimiento.
 * - Si falla: `error: true` y código de error específico.
 * @throws {ZodError} Si los datos de entrada no cumplen con las reglas de validación.
 */
const detalleCaja = async ( data : DetalleCajaInputs) 
: Promise<TipadoData<ResultDetalleCaja>>  =>{
    const verificarDetalle : DetalleCajaInputs = DetalleCajaSchema.parse(data);
    
    const detalleCajaResult = await dataCaja.detalleCajaAlta(verificarDetalle);

    if ( detalleCajaResult.code === 'DETALLE_CAJA_CREAR' && detalleCajaResult.data ){
        const { id_caja, id_categoria } = detalleCajaResult.data;
        return {
            error : false,
            message : "Se creo correctamnte el detalle de caja",
            data : { id_caja, id_categoria },
            code : "DETALLE_CAJA_OK"
        };
    };
    
    return {
        error : true,
        message : "No se pudo completar la creacion del detalle caja",
        code : "ERROR_ABRIR_CAJA_DETALLE"
    };    

};

/**
 * Servicio maestro para el cierre definitivo de caja.
 * * Orquesta el flujo de cierre siguiendo estos pasos:
 * 1. Valida el esquema de entrada (Blindaje de montos vacíos).
 * 2. Verifica que la caja efectivamente esté abierta.
 * 3. Ejecuta el arqueo contable para obtener el saldo teórico (balance_neto).
 * 4. Persiste el cierre comparando el saldo del sistema con el dinero real ingresado.
 * * @async
 * @param {CierreCajaInputs} data - Datos de cierre (id_caja, id_escuela, monto_final_real).
 * @returns {Promise<TipadoData<{ id_caja : number, estado : string }>>} 
 * - Éxito: Objeto con el estado 'cerrada'.
 * - Fallo: Error descriptivo si no hay caja abierta o falla el arqueo.
 * * @throws {ZodError} Si el monto_final_real es inválido o está vacío.
 */
const cierreCajaServicio = async ( data : CierreCajaInputs )
: Promise<TipadoData<{ id_caja : number , estado : string}>> =>{

    const cierreCajaData : CierreCajaInputs = CierreCajaSchema.parse( data);

    const vericarCajaResult = await dataCaja.verificarCajaAbierta({
        id_escuela : cierreCajaData.id_escuela, 
        estado     : "abierta"
    });

    if ( vericarCajaResult.code === "CAJA_ABIERTA_EXISTE" ){
       
        const arqueoCaja = await dataCaja.arqueoCaja(cierreCajaData);

        if (arqueoCaja.code === "ARQUEO_CAJA_EXISTE" && arqueoCaja.data?.balance_neto){

            const cierreCajaResult = await dataCaja.cierreCaja({
                id_caja : cierreCajaData.id_caja,
                monto_final_real : cierreCajaData.monto_final_real,
                monto_sistema : Number(arqueoCaja.data.balance_neto),
                id_escuela   : Number(cierreCajaData.id_escuela)
            });
        
            if ( cierreCajaResult.code === "CIERRE_CAJA_MODIFICAR") {
                return {
                    error : false,
                    message : "Caja cerrada exitosamente",
                    data : cierreCajaResult.data,
                    code : "CIERRE_CAJA_OK"
                };
            };    
        };        

    }else{
        return {
            error : true,
            message : "No existe ninguna caja abierta",
            code : "NO_HAY_CAJA_ABIERTA"
        };
    };

    return {
        error : true,
        message : "ERROR, No se logro cerrar caja ",
        code : "ERROR_ABRIR_CAJA_ARQUEO"
    };    
};


/**
 * Servicio de validación de estado de caja para operaciones financieras.
 * * Este método valida el id_escuela mediante el Schema correspondiente y consulta 
 * la existencia de una caja con estado 'abierta'. Es un paso crítico en el flujo 
 * de cobros para evitar registros de movimientos en sesiones de caja inexistentes o cerradas.
 *
 * @param {IdCajaAbiertaInputs} data - Inputs que contienen el id_escuela.
 * @returns {Promise<TipadoData<{id_caja : number}>>} Resultado de la validación:
 * - ID_CAJA_OK: Si la escuela tiene una caja abierta lista para operar.
 * - SIN_CAJA_ABIERTA: Si no hay sesiones activas (éxito en la consulta, pero resultado vacío).
 * - ERROR_ID_CAJA: Ante fallos técnicos en la comunicación con la capa de datos.
 * * @throws {ZodError} Si el formato del id_escuela es incorrecto según IdCajaAbiertaSchema.
 */
const idCajaAbiertaServicio = async ( data : IdCajaAbiertaInputs )
: Promise<TipadoData<{id_caja : number}>> => {
    const dataIdCaja : IdCajaAbiertaInputs = IdCajaAbiertaSchema.parse(data);
    const dataIdCajaResult = await dataCaja.idCajaAbierta(dataIdCaja);
   
    if(dataIdCajaResult.code === "ID_CAJA_EXISTE"){
        return{
            error : false,
            message : "La caja se encuentra abierta",
            data : dataIdCajaResult.data,
            code : "ID_CAJA_OK"
        };
    };
    if(dataIdCajaResult.code === "ID_CAJA_NO_EXISTE"){
        return{
            error : false,
            message : "No se encuentra la caja abierta",
            code : "SIN_CAJA_ABIERTA"
        };
    };
    
    return {
        error : true,
        message : "ERROR, No se logro obtener el id de caja",
        code : "ERROR_ID_CAJA"
    };         
};

/**
 * Procesa y normaliza las métricas del panel principal de una caja.
 * * @description
 * 1. Valida los datos de entrada (id_caja, id_escuela) mediante `PanelMetricasSchema`.
 * 2. Consulta la capa de datos para obtener cálculos SQL (ingresos, egresos, saldos).
 * 3. Mapea los códigos internos ("METRICAS_CAJA_EXISTE") a códigos de negocio ("METRICAS_OK").
 * * @param {PanelMetricasInputs} data - Parámetros de entrada (id_caja, id_escuela).
 * @returns {Promise<TipadoData<MetricaPanelPrincipal>>} Objeto estandarizado:
 * - `METRICAS_OK`: Si se obtuvieron los cálculos correctamente.
 * - `SIN_METRICAS`: Si la caja no existe o no se encontraron registros.
 * - `ERROR_METRICAS`: Error inesperado en la consulta.
 * * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */
const metricaPanelPrincipal  = async ( data : PanelMetricasInputs)
: Promise<TipadoData<MetricaPanelPrincipal>> => {
    const metricasData : PanelMetricasInputs = PanelMetricasSchema.parse(data);
    const metricasResult = await dataCaja.metricasCaja(metricasData);


    if ( metricasResult.code === "METRICAS_CAJA_EXISTE" ){
        return {
            error : false,
            message : "Metricas Caja",
            data : metricasResult.data,
            code : "METRICAS_OK"
        };           
    };

    if ( metricasResult.code === "METRICAS_CAJA_NO_EXISTE" ){
        // en teoria nunca pasaria, ya q simpre q entremos por aca la caja estaria abierta
        return {
            error : true,
            message : 'Sin metricas de caja',
            code    : 'SIN_METRICAS'
        }
    };

    return {
        error : true,
        message : "ERROR, No se logro obtener Metricas ",
        code : "ERROR_METRICAS"
    };       
};

export const method = {
    abrirCajaServicio : tryCatchDatos( abrirCaja ),
    detalleCaja       : tryCatchDatos( detalleCaja),
    cierreCajaServicio: tryCatchDatos( cierreCajaServicio), 
    idCajaAbiertaServicio : tryCatchDatos( idCajaAbiertaServicio),
    metricaPanelPrincipal : tryCatchDatos( metricaPanelPrincipal)
};

