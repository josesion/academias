
import { method as dataCaja} from "../data/caja.data";
import { method as dataCategoria } from "../data/categoria.cajas.data";
import { method as dataInscripcion} from "../data/inscripciones.data";

const { verificarCategoria } = dataCategoria;
const { saldoMetodoPago } = dataInscripcion;
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { registroHistorial } from "../utils/postHistorial";
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
         CuentasSesionInputs, listaTipoCuentasSesionSchema,    

} from "../squemas/cajas"; 
import { TipadoData } from "../tipados/tipado.data";
import { 
         ResultDetalleCaja,DetalleCajaMovimiento, CategoríaCaja
 } from "../tipados/caja.data.tipado"; 
import { type HistorialInputs } from "../squemas/historial"; 


/**
 * Servicio encargado de registrar un nuevo movimiento (detalle de caja) de ingreso o egreso,
 * validando los datos de entrada con Zod, comprobando la existencia de una caja abierta, 
 * verificando los fondos disponibles en caso de tratarse de un egreso, registrando la operación 
 * en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `DetalleCajaSchema`.
 * 2. Verifica si existe una caja abierta para la escuela correspondiente (`dataCaja.verificarCajaAbierta`).
 * 3. Verifica los detalles de la categoría asociada (`verificarCategoria`) para determinar si el movimiento es de tipo ingreso o egreso.
 * 4. Si el movimiento es un "egreso", valida que el saldo actual del método de pago (`saldoMetodoPago`) sea mayor o igual al monto solicitado.
 * 5. Si las validaciones son exitosas y existe una caja abierta, procede a registrar el detalle en la base de datos (`dataCaja.detalleCajaAlta`).
 * 6. Construye y registra un evento de auditoría en el módulo "CAJA" (con acción "INGRESO" o "EGRESO") utilizando `registroHistorial`.
 * 7. Retorna la respuesta de éxito con los identificadores correspondientes o un código de error específico si falta caja abierta, saldo o falla la operación.
 *
 * @async
 * @function detalleCaja
 * @param {Object} data - Objeto con los datos necesarios para registrar el movimiento en el detalle de caja 
 * (incluyendo ID de escuela, ID de caja, ID de cuenta, ID de categoría, monto, ID de usuario y descripción).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, códigos internos y los datos del detalle creado (como ID de caja y categoría).
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `DetalleCajaSchema`.
 * 
 * @example
 * const resultado = await detalleCaja({
 *    id_escuela: 1,
 *    id_caja: 15,
 *    id_cuenta: 2,
 *    id_categoria: 4,
 *    monto: 5000,
 *    id_usuario: 5,
 *    descripcion: "Pago de servicios"
 * });
 */
const detalleCaja = async ( data : DetalleCajaInputs) 
: Promise<TipadoData<ResultDetalleCaja>>  =>{

    const verificarDetalle : DetalleCajaInputs = DetalleCajaSchema.parse(data);
  

    const vericarCajaResult = await dataCaja.verificarCajaAbierta({
        id_escuela : verificarDetalle.id_escuela, 
        estado     : "abierta",
    });

    if ( vericarCajaResult.code === "CAJA_ABIERTA_NO_EXISTE" ){
        return {
            error : true,
            message : "No hay caja abierta",
            code : "SIN_CAJA_ABIERTA"
        };
    };

    let saldoExiste : boolean = true;
    
    const verificacionCat = await verificarCategoria( verificarDetalle.id_categoria );

    // veifico si es de el tipo de categoria es de egreso 
    if ( verificacionCat.code === 'CATEGORIA_EXISTE' &&  verificacionCat.data?.tipo_movimiento === "egreso" ){
        // si es de tipo egreso entra aca y entemos q ver si hay monto para realizar el egreso
        const verificarSaldo = await saldoMetodoPago( verificarDetalle.id_caja, verificarDetalle.id_cuenta );

        if (verificarSaldo.code === 'SALDO_EXISTE' && verificarSaldo.data !== undefined ){

            const saldoActual = Number(verificarSaldo.data.saldo_actual);
            const monto = Number(verificarDetalle.monto);

            if (saldoActual < monto) {
                saldoExiste = false;
            };
        };  
    };

    
    if ( saldoExiste === false){
        return{
            error : true, 
            message : "No cuentas con saldo para realizar esta accion",
            code : "SIN_SALDO"
        };
    };    

// aca es si pasa 
    if ( vericarCajaResult.code === "CAJA_ABIERTA_EXISTE" ){
        const detalleCajaResult = await dataCaja.detalleCajaAlta(verificarDetalle);

        if ( detalleCajaResult.code === 'DETALLE_CAJA_CREAR' && detalleCajaResult.data ){
            const montoHistorial : number = verificarDetalle.monto;    
            const accioFinal = verificacionCat.data?.tipo_movimiento === "ingreso" ? "INGRESO" : "EGRESO";

            const dataHistorial  : HistorialInputs = {
                id_escuela :  verificarDetalle.id_escuela ,
                id_usuario :  verificarDetalle.id_usuario,
                modulo : "CAJA",
                accion :  accioFinal,
                id_registro: Number(detalleCajaResult.data.id),
                descripcion:  `Se ${verificacionCat.data?.tipo_movimiento} $${montoHistorial} por ${verificacionCat.data?.nombre_categoria}`,
                datos: {
                    id_detalle :  detalleCajaResult.data.id,
                    movimiento : verificacionCat.data?.tipo_movimiento,
                    descripcion : verificacionCat.data?.nombre_categoria,
                    monto : montoHistorial
                } 
            };         

            await registroHistorial( dataHistorial);  


            const { id_caja, id_categoria } = detalleCajaResult.data;
            return {
                error : false,
                message : "Se creo correctamnte el detalle de caja",
                data : { id_caja, id_categoria },
                code : "DETALLE_CAJA_OK"
            };
        };

    };
    
    return {
        error : true,
        message : "No se pudo completar la creacion del detalle caja",
        code : "ERROR_ABRIR_CAJA_DETALLE"
    };    

};

/**
 * Servicio encargado de gestionar el cierre de una caja abierta, validando los datos de entrada con Zod,
 * verificando la existencia de una caja abierta previa, ejecutando el cierre en la base de datos, 
 * registrando el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CierresCajaSchema`.
 * 2. Verifica si existe una caja abierta para la escuela correspondiente (`dataCaja.verificarCajaAbierta`).
 * 3. Si la caja está abierta (`CAJA_ABIERTA_EXISTE`), ejecuta la función de cierre (`dataCaja.cierreCaja`).
 * 4. Construye y registra un evento de auditoría en el módulo "CAJA" con la acción "CERRAR", detallando el monto final real, la diferencia total y el monto calculado por el sistema mediante `registroHistorial`.
 * 5. Si el cierre es exitoso (`CIERRE_CAJA_MODIFICAR`), retorna la respuesta con los datos de la caja cerrada (ID y estado).
 * 6. Retorna un error específico si no hay caja abierta o si la operación del servidor falla.
 *
 * @async
 * @function cierreCajaServicio
 * @param {Object} data - Objeto con los datos necesarios para realizar el cierre de caja 
 * (incluyendo ID de escuela, ID de usuario, monto final real, diferencia total, monto del sistema, etc.).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, códigos internos y los datos de la caja cerrada (ID y estado).
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `CierresCajaSchema`.
 * 
 * @example
 * const resultado = await cierreCajaServicio({
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    monto_final_real: 45000,
 *    diferencia_total: 0,
 *    monto_sistema: 45000
 * });
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
        
        const dataHistorial  : HistorialInputs = {
            id_escuela :  cierreCajaData.id_escuela ,
            id_usuario :  cierreCajaData.id_usuario,
            modulo : "CAJA",
            accion : "CERRAR",
            id_registro: Number(cierreCajaResult.data?.id_caja),
            descripcion: `Se cerro caja con $${cierreCajaData.monto_final_real}y una diferencia de $${cierreCajaData.diferencia_total}, monto Sistema : $${cierreCajaData.monto_sistema} `,
            datos: {
                id_caja : cierreCajaResult.data?.id_caja
            } 
        }; 
            
        await registroHistorial( dataHistorial);  

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
export interface ResultMetrica{
    id_cuenta: number | string;
    nombre_cuenta: string;
    tipo_cuenta: "fisico" | "virtual",
    inicial_cuenta: number;
    movimiento_sesion: number;
    saldo_final_cuenta: number;
};


const listaMetricasCaja  = async ( data : PanelMetricasInputs) 
: Promise<TipadoData<ResultMetrica[]>> => {
    const metricasData : PanelMetricasInputs = PanelMetricasSchema.parse(data);
    const resultMetricas = await dataCaja.listaMetricasCaja(metricasData);
    console.log(resultMetricas)
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
export interface ResultListaCuentas{
    id_cuenta : number,
    nombre_cuenta : string ,
    tipo_cuenta : string 
};

//listado en las patnallas de egreso e ingreso 
const listaTipoCuentas = async ( parametros : ListaTipoCuentasInputs)
: Promise<TipadoData<ResultListaCuentas[]>> => {

    const dataLista : ListaTipoCuentasInputs = listaTipoCuentasSchema.parse( parametros );

    const listaTipoCuentasResult = await dataCaja.listaTipoCuentas( dataLista );
    console.log(listaTipoCuentasResult)
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
 * Servicio encargado de obtener el listado de cuentas financieras asociadas a la sesión 
 * de caja activa actual, validando previamente la existencia de una caja abierta.
 * 
 * @async
 * @function serviciosCuentaSesion
 * @param {CuentasSesionInputs} data - Objeto con los datos de entrada (por ejemplo, identificador de la escuela) para verificar la caja abierta.
 * @returns {Promise<TipadoData<{ id_cuenta: number, nombre_cuenta: string, tipo_cuenta: string }[]>>} Retorna una estructura con el estado del servicio, un mensaje descriptivo, el código de resultado y el array de cuentas en sesión si todo es correcto.
 */
const serviciosCuentaSesion = async( data : CuentasSesionInputs ) 
: Promise<TipadoData<{ id_cuenta :number, nombre_cuenta : string , tipo_cuenta : string}[]>>=>{

    const verifcarData : CuentasSesionInputs = listaTipoCuentasSesionSchema.parse(data);

    const dataIdCajaResult = await dataCaja.idCajaAbierta(verifcarData);
  
    if ( dataIdCajaResult.code ==='ID_CAJA_EXISTE' ) {


        const cuentaSesionResult = await dataCaja.listaTipoCuentasSesion( dataIdCajaResult.data?.id_caja );
      //  console.log(cuentaSesionResult)
        if ( cuentaSesionResult.code === 'LISTA_TIPO_CUENTAS_LISTED'){
            return {
                error : false, 
                message : "Listado de las cuentas en sesion.",
                data : cuentaSesionResult.data,
                code : 'LISTA_TIPOS_CUENTAS_OK'
            };
        };

        if ( cuentaSesionResult.code === 'NO_ACTIVE_LISTA_TIPO_CUENTAS'){
            return {
                error : true, 
                message : "Sin listado de las cuentas en sesion.",
                code : "SIN_LISTADO_CUENTAS"
            };
        };

    };

    if ( dataIdCajaResult.code ==='ID_CAJA_NO_EXISTE' ) {
        return {
            error : true, 
            message : "Abrir caja para continuar",
            code : "SIN_CAJA_ABIERTA"
        };
    };
    
    return {
        error : true, 
        message : "Error en el servidor, Caja Cuentas sesion.",
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

export interface ResultMetricasPrincipal{
    monto_inicial : number,
    total_ingresos : number,
    total_egresos  : number,
    flujo_dia : number,
    balance_neto  : number
};

const metricasPrincipal = async ( parametros : MetricasPrincipalInputs)
: Promise<TipadoData<ResultMetricasPrincipal[]>> =>{

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
 * Servicio encargado de gestionar la apertura de una nueva caja, validando los datos de entrada con Zod,
 * comprobando que no exista una caja abierta previamente para la escuela, ejecutando la transacción de apertura,
 * registrando el evento en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los parámetros de entrada mediante el esquema `AperturaCajaSchema`.
 * 2. Verifica si ya existe una caja abierta para la escuela correspondiente (`dataCaja.verificarCajaAbierta`).
 * 3. Si la caja ya se encuentra abierta (`CAJA_ABIERTA_EXISTE`), retorna un error indicando dicha condición.
 * 4. Si no hay caja abierta, ejecuta la transacción de apertura de caja (`dataCaja.aperturaCajaTransaccion`).
 * 5. Si la transacción es exitosa (`TRANSACCION_OK`), construye y registra un evento de auditoría en el módulo "CAJA" con la acción "ABRIR" mediante `registroHistorial`.
 * 6. Retorna la respuesta de éxito con los datos de la caja abierta (ID de caja) o un código de error del servidor si la operación falla.
 *
 * @async
 * @function aperturaCajaTransaccion
 * @param {Object} parametros - Objeto con los datos necesarios para realizar la apertura de caja 
 * (incluyendo ID de escuela, ID de usuario y el detalle de cuentas/montos iniciales).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, códigos internos y los datos de la caja abierta (ID de caja).
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `AperturaCajaSchema`.
 * 
 * @example
 * const resultado = await aperturaCajaTransaccion({
 *    id_escuela: 1,
 *    id_usuario: 5,
 *    detalle: [
 *       { id_cuenta: 1, monto: 10000, nombre_cuenta: "Efectivo" }
 *    ]
 * });
 */
const aperturaCajaTransaccion = async ( parametros : AperturaCajaInput )
:Promise<TipadoData<{ id_caja : number, montoTotal : number}>> =>{
   
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

//    console.dir(aperturaRestult.data, { depth: null });
 
    if ( aperturaRestult.code === 'TRANSACCION_OK'){

            const dataHistorial  : HistorialInputs = {
                id_escuela :  aperturaValidada.id_escuela ,
                id_usuario :  aperturaValidada.id_usuario,
                modulo : "CAJA",
                accion : "ABRIR",
                id_registro: Number(aperturaRestult.data?.id_caja),
                descripcion: `Apertua de caja con ${aperturaRestult.data?.montoTotal}`,
                datos: {
                    id_caja : aperturaRestult.data?.id_caja,
                    monto_apertura : aperturaRestult.data?.montoTotal,
                    listado : aperturaRestult.data?.categorias
                } 
            }; 
            
            await registroHistorial( dataHistorial);   

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
    serviciosCuentaSesion : tryCatchDatos( serviciosCuentaSesion ),
};

