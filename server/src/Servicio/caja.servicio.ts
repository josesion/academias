
import { method as dataCaja} from "../data/caja.data";
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";

// ──────────────────────────────────────────────────────────────
// Sección de  typados
// ──────────────────────────────────────────────────────────────
import { 
         DetalleCajaInputs ,DetalleCajaSchema,
         CierresCajaInputs, CierresCajaSchema,
         IdCajaAbiertaInputs, IdCajaAbiertaSchema,
         PanelMetricasInputs, PanelMetricasSchema,
         ListaMovimientosCajaInputs, listaMovimientosCajaSchema,
         ListaCategoriaCajaTipoInputs, ListaCategoriaCajaTipoSchema,
         ListaTipoCuentasInputs, listaTipoCuentasSchema,
         MetricasPrincipalInputs , MetricasPrincipalSchema,
         AperturaCajaInput, AperturaCajaSchema,
 } from "../squemas/cajas"; 
import { TipadoData } from "../tipados/tipado.data";
import { 
         ResultDetalleCaja,DetalleCajaMovimiento, CategoríaCaja
 } from "../tipados/caja.data.tipado"; 


/**
 * Servicio para registrar un nuevo movimiento (ingreso o egreso) en el detalle de una caja activa.
 * * Este proceso garantiza la integridad del flujo de caja mediante los siguientes pasos:
 * 1. Valida los datos de entrada (monto, cuenta, categoría, etc.) usando DetalleCajaSchema.
 * 2. Verifica que la escuela tenga una sesión de caja actualmente 'abierta'.
 * 3. Si la caja existe, delega la inserción a la capa de datos (detalleCajaAlta).
 * 4. Retorna el ID de la caja y de la categoría del movimiento creado.
 *
 * @async
 * @param {DetalleCajaInputs} data - Objeto con los datos del movimiento (id_escuela, id_cuenta, id_categoria, monto, etc.).
 * @returns {Promise<TipadoData<ResultDetalleCaja>>} 
 * Promesa con el resultado de la operación y datos del registro creado.
 * * @throws {ZodError} Si los datos del movimiento no cumplen con el esquema de validación.
 * * @example
 * // Códigos de retorno:
 * // - DETALLE_CAJA_OK: Registro exitoso.
 * // - SIN_CAJA_ABIERTA: No se puede registrar movimientos si la caja está cerrada.
 * // - ERROR_ABRIR_CAJA_DETALLE: Error inesperado en la base de datos.
 */

const detalleCaja = async ( data : DetalleCajaInputs) 
: Promise<TipadoData<ResultDetalleCaja>>  =>{

    const verificarDetalle : DetalleCajaInputs = DetalleCajaSchema.parse(data);
  

    const vericarCajaResult = await dataCaja.verificarCajaAbierta({
        id_escuela : verificarDetalle.id_escuela, 
        estado     : "abierta",
    });

    if ( vericarCajaResult.code === "CAJA_ABIERTA_EXISTE" ){
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

    };

    if ( vericarCajaResult.code === "CAJA_ABIERTA_NO_EXISTE" ){
        return {
            error : true,
            message : "No hay caja abierta",
            code : "SIN_CAJA_ABIERTA"
        };
    };

    
    return {
        error : true,
        message : "No se pudo completar la creacion del detalle caja",
        code : "ERROR_ABRIR_CAJA_DETALLE"
    };    

};

/**
 * Servicio encargado de la lógica de negocio para el cierre de caja.
 * * El proceso sigue este flujo:
 * 1. Valida los datos de entrada mediante el esquema de Zod (CierresCajaSchema).
 * 2. Verifica que efectivamente exista una caja abierta para la escuela proporcionada.
 * 3. Ejecuta la persistencia del cierre (UPDATE) en la base de datos.
 * 4. Retorna una respuesta estandarizada según el resultado de la operación.
 *
 * @async
 * @param {CierresCajaInputs} data - Objeto con los datos del cierre (montos, arqueo_detalle, observaciones).
 * @returns {Promise<TipadoData<{ id_caja : number , estado : string }>>} 
 * Promesa que resuelve a un objeto TipadoData con el estado final de la caja y códigos de respuesta.
 * * @throws {ZodError} Si los datos de entrada no cumplen con las validaciones de `CierresCajaSchema`.
 * * @example
 * // Códigos de retorno exitosos:
 * // - CIERRE_CAJA_OK: Caja finalizada correctamente.
 * // Códigos de error manejados:
 * // - NO_HAY_CAJA_ABIERTA: No se encontró sesión activa para cerrar.
 * // - ERROR_SERVIDOR: Error inesperado en la persistencia.
 */
const cierreCajaServicio = async ( data : CierresCajaInputs )
: Promise<TipadoData<{ id_caja : number , estado : string,}>> =>{

    const cierreCajaData : CierresCajaInputs = CierresCajaSchema.parse( data);

    const vericarCajaResult = await dataCaja.verificarCajaAbierta({
        id_escuela : cierreCajaData.id_escuela, 
        estado     : "abierta",
    });

    if ( vericarCajaResult.code === "CAJA_ABIERTA_EXISTE" ){
       
        const cierreCajaResult = await dataCaja.cierreCaja(cierreCajaData);
             
        if ( cierreCajaResult.code === "CIERRE_CAJA_MODIFICAR") {
                return {
                    error : false,
                    message : "Caja cerrada exitosamente",
                    data : cierreCajaResult.data,
                    code : "CIERRE_CAJA_OK"
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
        code : "ERROR_SERVIDOR"
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
 * - ERROR_SERVIDOR: Ante fallos técnicos en la comunicación con la capa de datos.
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
        code : "ERROR_SERVIDOR"
    };         
};



/**
 * Servicio encargado de procesar y validar las métricas financieras de la caja activa.
 * * Valida los datos de entrada mediante PanelMetricasSchema, consulta los saldos 
 * por cuenta y transforma el código de respuesta para el controlador.
 * * @async
 * @function listaMetricasCaja
 * @param {PanelMetricasInputs} data - Parámetros de filtrado para las métricas (ej. id_caja, id_escuela).
 * * @returns {Promise<{
 * error: boolean, 
 * message: string, 
 * data?: any, 
 * code: string
 * }>} Objeto de respuesta estandarizado:
 * - `METRICAS_CAJA_CUENTAS_OK`: Éxito con datos.
 * - `SIN_METRICAS_CAJA_CUENTAS`: No hay movimientos o caja activa.
 * - `ERROR_SERVIDOR`: Error inesperado en la base de datos.
 * * @throws {ZodError} Si los datos de entrada no cumplen con el esquema de validación.
 */

// aca
const listaMetricasCaja  = async ( data : PanelMetricasInputs) 
: Promise<TipadoData<{
        id_cuenta: number | string;
        nombre_cuenta: string;
        inicial_cuenta: number;
        movimiento_sesion: number;
        saldo_final_cuenta: number;
}[]>> => {
    const metricasData : PanelMetricasInputs = PanelMetricasSchema.parse(data);
    const resultMetricas = await dataCaja.listaMetricasCaja(metricasData);
 
    if ( resultMetricas.code === "METRICAS_CAJA_CUENTAS_LISTED"){ 
        return {
            error : false , 
            message : "Metricas Caja Cuentas",
            data : resultMetricas.data,
            code : "METRICAS_CAJA_CUENTAS_OK"
        };
    };
    if ( resultMetricas.code === "NO_ACTIVE_METRICAS_CAJA_CUENTAS"){
       return {
            error : true ,
            message : "No se encontraron metricas",
            code : "SIN_METRICAS_CAJA_CUENTAS"
       }; 
    };

    return {
        error : true ,
        message : "Error, no se pudieron obtener las metricas",
        code : "ERROR_SERVIDOR"            
    };

};

/**
 * Controlador de negocio para obtener movimientos de caja.
 * Valida la entrada con Zod, consulta la base de datos y normaliza la respuesta.
 * * @param {ListaMovimientosCajaInputs} data - Parámetros de entrada (id_caja, limite, offset).
 * @returns {Promise<TipadoData<DetalleCajaMovimiento[]>>} Resultado de la operación con data tipada.
 * * @example
 * // Caso de éxito: devuelve array de movimientos
 * // Caso vacío: devuelve error: false pero con código "MOVIMIENTOS_CAJA_VACIO"
 * // Caso error: devuelve error: true para ser capturado por el manejador 
 */
const movimientosCaja = async ( data : ListaMovimientosCajaInputs)
: Promise<TipadoData<DetalleCajaMovimiento[]>> =>{
    const movimientosData :  ListaMovimientosCajaInputs = listaMovimientosCajaSchema.parse(data);
    const movimientosResult = await dataCaja.listaMovimientosCaja(movimientosData);

    if ( movimientosResult.code === 'LISTA_MOVIMIENTOS_CAJA_LISTED'){
        return{
            error : false, 
            message : "Movimientos de caja obtenidos",
            data : movimientosResult.data,
            code : "MOVIMIENTOS_CAJA_OK"
        };
    };
    
    if ( movimientosResult.code === 'NO_ACTIVE_LISTA_MOVIMIENTOS_CAJA'){
        return{
            error : false,
            message : "No se encontraron movimientos de caja",
            code : "MOVIMIENTOS_CAJA_VACIO"
        };
    };        

    return {
        error : true,
        message : "ERROR, No se logro obtener los movimientos de caja ",
        code : "ERROR_SERVIDOR"
    };  
};

/**
 * Controlador para listar categorías de caja filtradas por tipo y estado.
 * Valida los datos de entrada mediante un esquema y gestiona la respuesta del servicio.
 * * @async
 * @function listaCategiriaCajaTipos
 * @param {ListaCategoriaCajaTipoInputs} data - Parámetros de entrada (id_escuela, tipo, estado).
 * * @returns {Promise<TipadoData<CategoríaCaja[]>>} 
 * Devuelve un objeto estandarizado:
 * - `error: false` + `code: LISTADO_CATEGORIA_OK`: Si se encontraron datos.
 * - `error: false` + `code: LISTADO_CATEGORIA_VACIO`: Si no hay categorías activas.
 * - `error: true` + `code: ERROR_LISTADO_CATEGORIA_CAJA`: Si hubo un fallo en el servicio o validación.
 * * @throws {ZodError} Si los datos de entrada no cumplen con `ListaCategoriaCajaTipoSchema`.
 */
const listaCategiriaCajaTipos = async ( data : ListaCategoriaCajaTipoInputs)
: Promise<TipadoData<CategoríaCaja[]>> =>{
    const dataLista : ListaCategoriaCajaTipoInputs = ListaCategoriaCajaTipoSchema.parse(data);
  
    const listaServicioResult = await dataCaja.listaCategiriaCajaTipos( dataLista );
  
    if ( listaServicioResult.code === "LISTA_CATEGORIA_CAJA_TIPO_LISTED"){
        return {    
            error : false , 
            message : "Listado Categorias ok",
            data : listaServicioResult.data,
            code : "LISTADO_CATEGORIA_OK"
        };
    };

    if ( listaServicioResult.code === "NO_ACTIVE_LISTA_CATEGORIA_CAJA_TIPO"){
        return{
            error : false, 
            message : "Lista Categotia vacia",
            code : "LISTADO_CATEGORIA_VACIO"
        };
    };

    return {
        error : true,
        message : "ERROR al obtener el listado de categorias",
        code : "ERROR_SERVIDOR"
    };  
};


/**
 * Servicio encargado de gestionar la obtención de las cuentas de una escuela.
 * * Este método valida los parámetros de entrada mediante un esquema de Zod,
 * consulta la capa de persistencia de datos y mapea los códigos de resultado
 * internos a formatos entendibles por el controlador.
 *
 * @async
 * @function listaTipoCuentas
 * @param {ListaTipoCuentasInputs} parametros - Datos de entrada (id_escuela, estado).
 * @throws {ZodError} Si los parámetros no cumplen con el esquema `listaTipoCuentasSchema`.
 * @returns {Promise<ResultadoServicio>} Objeto con el estado de la operación:
 * - `error`: boolean indicando si falló.
 * - `message`: Descripción del resultado.
 * - `data`: (Opcional) Array de cuentas si la operación fue exitosa.
 * - `code`: Código de respuesta interno para el mapeo del controlador.
 */
const listaTipoCuentas = async ( parametros : ListaTipoCuentasInputs)
: Promise<TipadoData<{ id_cuenta : number, nombre_cuenta : string , tipo_cuenta : string}[]>> => {
    const dataLista : ListaTipoCuentasInputs = listaTipoCuentasSchema.parse( parametros );
   
    const listaTipoCuentasResult = await dataCaja.listaTipoCuentas( dataLista );
   
    if ( listaTipoCuentasResult.code === "LISTA_TIPO_CUENTAS_LISTED"){
        return{
            error : false,
            message : "Listado Tipo Cuentas ok",
            data : listaTipoCuentasResult.data,
            code : "LISTA_TIPOS_CUENTAS_OK"
        };
    };
 
    if ( listaTipoCuentasResult.code === "NO_ACTIVE_LISTA_TIPO_CUENTAS"){
        return {
            error : true,
            message : "Lista Tipo Cuentas vacia",
            code : "LISTA_TIPO_CUENTAS_VACIO"
        };
    };

    return {
        error : true,
        message : "Error, no se pudo obtener el listado de tipo de cuentas",
        code : "ERROR_SERVIDOR"
    };

};


/**
 * Procesa y valida la obtención de las métricas financieras principales de una caja.
 * * @async
 * @function metricasPrincipal
 * @param {MetricasPrincipalInputs} parametros - Objeto con id_caja e id_escuela.
 * @returns {Promise<TipadoData<Array<{
 * monto_inicial: number,
 * total_ingresos: number,
 * total_egresos: number,
 * balence_neto: number,
 * monto_sistema_calculado: number
 * }>>>} Objeto de respuesta estandarizado con los datos calculados o error.
 * * @throws {ZodError} Si los parámetros de entrada no cumplen con MetricasPrincipalSchema.
 * * @example
 * const resultado = await cajaServicio.metricasPrincipal({ id_caja: 6, id_escuela: 107 });
 * if (!resultado.error) {
 * console.log(resultado.data[0].balence_neto);
 * }
 */
const metricasPrincipal = async ( parametros : MetricasPrincipalInputs)
: Promise<TipadoData<{
            monto_inicial : number,
            total_ingresos : number,
            total_egresos  : number,
            flujo_dia : number,
            balance_neto  : number }[]>> =>{

    const metricasData : MetricasPrincipalInputs = MetricasPrincipalSchema.parse(parametros);
  
    const metricasResult = await dataCaja.metricasPrincipal(metricasData);
   
    if ( metricasResult.code === "METRICAS_PANEL_LISTED") {
        return {
            error : false, 
            message : "Listado metricas principal ok",
            data : metricasResult.data,
            code : "METRICAS_PRINCIPAL_OK"
        };
    };
    if ( metricasResult.code === "NO_ACTIVE_METRICAS_PANEL"){
        return {
            error : true,
            message : "No existen metricas del panel principal",
            code : "SIN_METRICAS_PANEL_PRINCIPAL"
        };
    };

    return {
        error : true,
        message : "Error, no se pudo obtener el resultado de las metricas de caja",
        code : "ERROR_SERVIDOR"
    };
   
};

/**
 * Servicio de lógica de negocio para la apertura de una nueva caja.
 * * Este servicio coordina el flujo de apertura realizando:
    * 1. Validación de esquema mediante Zod (AperturaCajaSchema).
    * 2. Verificación preventiva para evitar duplicidad de cajas abiertas en la misma escuela.
 * 3. Ejecución de la transacción atómica para insertar cabecera y detalles de saldos iniciales.
 * * @async
 * @function aperturaCajaTransaccion
 * @param {AperturaCajaInput} parametros - Datos de apertura validados por el esquema de entrada.
 * @param {number} parametros.id_escuela - ID de la escuela donde se abre la caja.
 * @param {number} parametros.id_usuario_apertura - ID del usuario responsable.
 * @param {Array} parametros.detalle - Array con los saldos iniciales por cuenta.
 * * @returns {Promise<TipadoData>} Objeto de respuesta estandarizado:
 * - Si tiene éxito: { error: false, code: 'CAJA_ABIERTA_OK', data: { id_caja: number } }
 * - Si ya existe caja: { error: true, code: 'CAJA_ABIERTA', message: "..." }
 * - Si falla la DB: { error: true, code: 'ERROR_SERVIDOR', message: "..." }
 * * @throws {ZodError} Si los parámetros no cumplen con el esquema definido.
 */

const aperturaCajaTransaccion = async ( parametros : AperturaCajaInput ) =>{
   
    const aperturaValidada : AperturaCajaInput = AperturaCajaSchema.parse(parametros)

    const vericarResult = await dataCaja.verificarCajaAbierta( aperturaValidada);
   
    if ( vericarResult.code === "CAJA_ABIERTA_EXISTE"){
       return {
          error : true,
          message : "La caja se encuentra abierta",
          code : "CAJA_ABIERTA"          
       }
    };
    
    const aperturaRestult = await dataCaja.aperturaCajaTransaccion( aperturaValidada);

    if ( aperturaRestult.code === 'TRANSACCION_OK'){
        return{
            error : false, 
            message : "Se abrio Correctamente la caja",
            data :  aperturaRestult.data,
            code : "CAJA_ABIERTA_OK" 
        };
    };
     
    return {
        error : true,
        message : "No se pudo completar la apertura de caja",
        code : "ERROR_SERVIDOR"  
    };
};


export const method = {
    detalleCaja       : tryCatchDatos( detalleCaja),
    cierreCajaServicio: tryCatchDatos( cierreCajaServicio), 
    idCajaAbiertaServicio : tryCatchDatos( idCajaAbiertaServicio),
    movimientosCaja : tryCatchDatos( movimientosCaja ),
    listaCategiriaCajaTipos : tryCatchDatos( listaCategiriaCajaTipos ),
    listaMetricasCaja : tryCatchDatos(listaMetricasCaja),
    listaTipoCuentas : tryCatchDatos( listaTipoCuentas ),
    metricasPrincipal : tryCatchDatos( metricasPrincipal ),
    aperturaCajaTransaccion : tryCatchDatos( aperturaCajaTransaccion ),
};

