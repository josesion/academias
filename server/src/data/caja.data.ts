
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
// ──────────────────────────────────────────────────────────────
// Sección de  Typados
// ──────────────────────────────────────────────────────────────
import { VerificarCajaInputs, AbrirCajaInputs, 
         DetalleCajaInputs, CierreCajaInputs,
         IdCajaAbiertaInputs,  } from "../squemas/cajas"; 
import { ResultAqueoCaja, MetricaPanelPrincipal } from "../tipados/caja.data.tipado"; 
import { TipadoData } from "../tipados/tipado.data";


/**
 * Verifica si existe una caja en un estado específico (usualmente 'abierta') para una escuela.
 * * Utiliza una consulta optimizada con `SELECT 1` para validar la existencia 
 * sin cargar datos innecesarios de la tabla.
 * * @param {VerificarCajaInputs} data - Objeto con los parámetros de búsqueda.
 * @param {number} data.id_escuela - ID de la escuela a consultar.
 * @param {'abierta'|'cerrada'} data.estado - Estado de la caja que se desea verificar.
 * * @returns {Promise<TipadoData<{hay_caja_abierta : number}>>} 
 * Devuelve un objeto de respuesta con `hay_caja_abierta: 1` si se encuentra, o la estructura de error/vacío si no.
 * * @example
 * const res = await verificarCajaAbierta({ id_escuela: 107, estado: 'abierta' });
 * if (res.data && res.data.hay_caja_abierta === 1) {
 * // Bloquear apertura de nueva caja
 * }
 */
const verificarCajaAbierta = async( data : VerificarCajaInputs) 
: Promise<TipadoData<{hay_caja_abierta : number}>> =>{

    const sql : string = `SELECT 1 AS hay_caja_abierta
                            FROM cajas 
                            WHERE id_escuela = ? AND estado = ?`;

    const { id_escuela, estado} = data; 
    const valores : unknown[] = [id_escuela, estado];     
    return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores,
        entidad : "CAJA_ABIERTA"
    });                  

};


/**
 * Realiza la apertura de una nueva caja en la base de datos.
 * * @async
 * @param {AbrirCajaInputs} data - Objeto con la información necesaria para la apertura.
 * @param {number} data.id_escuela - El ID de la escuela propietaria de la caja.
 * @param {number|null} data.id_usuario - ID del usuario que abre la caja (puede ser null).
 * @param {number} data.monto_inicial - Cantidad de dinero base con la que inicia la sesión.
 * * @returns {Promise<TipadoData<AbrirCajaInputs>>} 
 * Promesa con el resultado de la operación, incluyendo los datos creados para el manejo en el frontend.
 * * @description
 * Esta función inserta un registro en la tabla `cajas`. Por defecto, la base de datos
 * asigna el estado 'abierta' y la fecha actual. Utiliza el helper `iudEntidad` para 
 * estandarizar la respuesta y el manejo de errores.
 */
const abrirCaja = async( data : AbrirCajaInputs)
: Promise<TipadoData<AbrirCajaInputs>> => {
    const sql : string = `INSERT INTO cajas (
                            id_escuela, 
                            id_usuario, 
                            monto_inicial
                        ) VALUES (
                            ?,      
                            ?,     -- El ID del profesor/usuario (desde la sesión)
                            ?
                        );`; 
   const {id_escuela , monto_inicial , id_usuario} = data;
   const valores : unknown[] = [id_escuela, id_usuario, monto_inicial];
   const datosRetorno = {id_escuela , monto_inicial, id_usuario};
   
   return await iudEntidad<AbrirCajaInputs>({
        slqEntidad : sql,
        valores,
        metodo : "CREAR",
        entidad : "Abrir_Caja",
        datosRetorno : datosRetorno
   });
};


/**
 * Registra un nuevo movimiento de entrada o salida en el detalle de una caja.
 * * Esta función se encarga de realizar el INSERT en la tabla `detalle_caja`, 
 * vinculando el movimiento a una caja abierta, una categoría contable 
 * y un método de pago específico.
 * * @async
 * @param {DetalleCajaInputs} data - Objeto con los datos del movimiento.
 * @param {number} data.id_caja - ID de la caja activa donde se registra el movimiento.
 * @param {number} data.id_categoria - ID de la categoría (ej: Cuotas, Gastos, Ventas).
 * @param {number} data.monto - Valor numérico del movimiento (positivo para ingresos).
 * @param {string} data.metodo_pago - Forma de pago (ej: 'efectivo', 'transferencia', 'debito').
 * @param {string|null} data.descripcion - Nota u observación libre sobre el movimiento.
 * @param {number|null} data.referencia_id - ID opcional vinculado (ej: ID de una inscripción o factura).
 * * @returns {Promise<TipadoData<DetalleCajaInputs>>} Resultado de la operación con los datos creados.
 * * @example
 * const nuevoMovimiento = await detalleCajaAlta({
 * id_caja: 1,
 * id_categoria: 5,
 * monto: 2500.50,
 * metodo_pago: 'efectivo',
 * descripcion: 'Pago cuota Marzo',
 * referencia_id: 102
 * });
 */
const detalleCajaAlta = async( data : DetalleCajaInputs) 
: Promise<TipadoData<DetalleCajaInputs>> =>{
    const sql : string = `INSERT INTO detalle_caja (
                                id_caja, 
                                id_categoria, 
                                monto, 
                                metodo_pago, 
                                descripcion, 
                                referencia_id
                            ) VALUES (
                                ?, -- id_caja (la que está abierta actualmente)
                                ?, -- id_categoria (ej: 5 para 'Cuotas')
                                ?, -- monto (ej: 1500.50)
                                ?, -- metodo_pago ('efectivo', 'transferencia', etc.)
                                ?, -- descripcion (el "anotador" libre)
                                ?  -- referencia_id (null o el ID de una inscripción/venta)
                            );`;
    const { id_caja, id_categoria, monto, metodo_pago, descripcion, referencia_id} = data;                        
    const valores : unknown[] = [id_caja, id_categoria, monto, metodo_pago, descripcion, referencia_id];
    return await iudEntidad({
        slqEntidad : sql,
        valores,
        metodo : "CREAR",
        entidad : "Detalle_Caja",
        datosRetorno : data
    });
}; 

/**
 * Realiza el cálculo contable (Arqueo) de una caja específica.
 * * Cruza los datos de la tabla `cajas` con sus movimientos en `detalle_caja` para obtener
 * los totales de ingresos, egresos y el saldo teórico que debería haber según el sistema.
 * * @async
 * @param {CierreCajaInputs} data - Datos de entrada para identificar la caja.
 * @param {number} data.id_caja - El ID de la caja de la cual se quiere obtener el arqueo.
 * * @returns {Promise<TipadoData<ResultAqueoCaja>>} Objeto con los cálculos:
 * - `monto_inicial`: El saldo con el que abrió la caja.
 * - `total_ingresos`: Suma de todos los movimientos tipo 'ingreso'.
 * - `total_egresos`: Suma de todos los movimientos tipo 'egreso'.
 * - `balance_neto`: Resultado final (Inicial + Ingresos - Egresos).
 * - `monto_sistema_calculado`: El valor de referencia contra el cual se comparará el dinero físico.
 * * @description
 * La consulta utiliza `COALESCE` para evitar valores `null` si no hay movimientos registrados.
 * El uso de `LEFT JOIN` permite que el arqueo se realice incluso si la caja acaba de abrirse
 * y no tiene registros de actividad todavía.
 */
const arqueoCaja = async ( data : CierreCajaInputs ) 
: Promise<TipadoData<ResultAqueoCaja>> => {
    const slq : string = `SELECT 
                                c.id_caja,
                                c.monto_inicial,
                                -- Sumamos ingresos (si no hay, devuelve 0)
                                COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_ingresos,
                                -- Sumamos egresos (si no hay, devuelve 0)
                                COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'egreso' THEN det.monto ELSE 0 END), 0) AS total_egresos,
                                -- BALANCE NETO: monto_inicial + (ingresos - egresos)
                                (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE -det.monto END), 0)) AS balance_neto,
                                -- Lo mismo para tu validación de sistema
                                (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE -det.monto END), 0)) AS monto_sistema_calculado
                            FROM cajas c
                            -- El LEFT JOIN es clave: trae la caja aunque no tenga filas en detalle_caja
                            LEFT JOIN detalle_caja det ON c.id_caja = det.id_caja
                            -- Segundo LEFT JOIN: para que si un detalle no tiene categoría, no rompa la suma
                            LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                            WHERE c.id_caja = ?
                            GROUP BY c.id_caja, c.monto_inicial`;
    const valores : unknown[] = [ data.id_caja ]; 
    return await buscarExistenteEntidad({
        slqEntidad : slq,
        valores,
        entidad : "ARQUEO_CAJA"
    });
};

/**
 * Obtiene las métricas financieras principales de una caja específica.
 * * Calcula:
 * - Totales de ingresos y egresos.
 * - Flujo neto del día (ingresos - egresos).
 * - Desglose de ingresos por método de pago (efectivo, transferencia, débito, crédito).
 * - Balance total real (monto inicial + movimientos).
 * * @param {CierreCajaInputs} data - Objeto con los criterios de búsqueda.
 * @param {number} data.id_caja - Identificador único de la caja.
 * @param {number} data.id_escuela - Identificador de la escuela para asegurar pertenencia.
 * * @returns {Promise<TipadoData<MetricaPanelPrincipal>>} Promesa con el objeto de métricas.
 * Si no hay movimientos, los valores retornan en 0 mediante COALESCE.
 * Si la caja no existe, retorna un error con código "METRICAS_CAJA_NO_EXISTE".
 * * @example
 * const metricas = await metricaPanelPrincipal({ id_caja: 1, id_escuela: 10 });
 */
const metricaPanelPrincipal = ( data : CierreCajaInputs )
: Promise<TipadoData<MetricaPanelPrincipal>> => {
   const slq : string = `SELECT 
                            c.id_caja,
                            c.monto_inicial,
                            -- 1. Totales Generales
                            COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_ingresos,
                            COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'egreso' THEN det.monto ELSE 0 END), 0) AS total_egresos,
                            
                            -- 2. Total del Día (Monto inicial + flujo neto: ingresos - egresos)
                            (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE -det.monto END), 0)) AS flujo_del_dia,

                            -- 3. Desglose por Método de Pago (Solo de ingresos para el arqueo)
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'efectivo' AND cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_efectivo,
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'transferencia' AND cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_transferencia,
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'debito' AND cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_debito,
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'credito' AND cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_credito,

                            -- 4. Balance Final de Caja (Monto inicial + todos los movimientos)
                            (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE -det.monto END), 0)) AS balance_total_real

                        FROM cajas c
                        LEFT JOIN detalle_caja det ON c.id_caja = det.id_caja
                        LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        WHERE c.id_caja = ? and c.id_escuela = ?
                        GROUP BY c.id_caja, c.monto_inicial;`;
   const valores : unknown[] = [ data.id_caja, data.id_escuela];     
   return buscarExistenteEntidad({
        slqEntidad : slq,
        valores,
        entidad : "METRICAS_CAJA"
   });                 
};


/**
 * Ejecuta el cierre definitivo de una caja en la base de datos.
 * * Actualiza los montos finales, cambia el estado a 'cerrada' y registra la fecha/hora
 * exacta del cierre. Utiliza condiciones de seguridad para asegurar que solo se cierren
 * cajas que pertenecen a la escuela correspondiente y que estén actualmente abiertas.
 * * @async
 * @param {Object} data - Datos necesarios para el cierre.
 * @param {number} data.id_caja - ID único de la caja a cerrar.
 * @param {number} data.monto_final_real - Dinero físico real reportado por el usuario (Validado por Zod).
 * @param {number} data.monto_sistema - Saldo teórico calculado por el arqueo del sistema.
 * @param {number} data.id_escuela - ID de la escuela para asegurar pertenencia de los datos.
 * * @returns {Promise<TipadoData<{ id_caja : number, estado : string }>>} Objeto confirmando el cierre y el nuevo estado.
 * * @description
 * La consulta emplea `CURRENT_TIMESTAMP` para la auditoría de tiempo y requiere que `estado = 'abierta'`,
 * lo que previene cierres duplicados o accidentales de cajas ya finalizadas.
 */
const cierreCaja =async ( data : { id_caja: number, monto_final_real: number, monto_sistema: number, id_escuela : number })
: Promise<TipadoData<{ id_caja : number , estado : string}>> => {
    
    const sql : string = `UPDATE cajas 
                            SET 
                                monto_sistema = ?, 
                                monto_final_real = ?, 
                                estado = 'cerrada', 
                                fecha_cierre = CURRENT_TIMESTAMP
                            WHERE id_caja = ? AND estado = 'abierta' AND id_escuela = ?;`;
    const {id_caja , monto_final_real ,monto_sistema,  id_escuela} =data ;
  
    const datosRetorno = { id_caja , estado : "cerrada" }                        
    const valores : unknown[] = [ monto_sistema, monto_final_real, id_caja, id_escuela ];
    return await iudEntidad({
        slqEntidad : sql ,
        valores ,
        metodo : "MODIFICAR",
        entidad : "CIERRE_CAJA",
        datosRetorno : datosRetorno
    });                       
};

/**
 * Consulta la base de datos para obtener el ID de la caja activa de una escuela.
 * * * Esta función busca en la tabla 'cajas' un registro que cumpla simultáneamente 
 * con tener el estado 'abierta' y pertenecer al id_escuela proporcionado. 
 * Utiliza la utilidad 'buscarExistenteEntidad' para manejar la ejecución de la 
 * sentencia y el mapeo de la respuesta.
 *
 * @param {IdCajaAbiertaInputs} data - Objeto que contiene el id_escuela para filtrar.
 * @returns {Promise<TipadoData<{id_caja : number}>>} Resultado de la operación:
 * - Éxito: Objeto con id_caja si existe una sesión abierta.
 * - Fallo: Error de entidad si no hay cajas abiertas o el ID de escuela es inválido.
 */
const idCajaAbierta = async ( data : IdCajaAbiertaInputs ) 
: Promise<TipadoData<{id_caja : number }>>    =>{
        const sql : string = `select id_caja from cajas c 
                             where  c.estado = "abierta" and c.id_escuela = ?;`;
        const valores : unknown[] = [ data.id_escuela ];
        return await buscarExistenteEntidad({
            slqEntidad : sql,
            valores,
            entidad : "ID_CAJA"
        });
};

export const method = {
    verificarCajaAbierta : tryCatchDatos( verificarCajaAbierta ),
    abrirCaja  : tryCatchDatos( abrirCaja ),
    detalleCajaAlta : tryCatchDatos( detalleCajaAlta ),
    arqueoCaja   : tryCatchDatos( arqueoCaja ),
    cierreCaja   : tryCatchDatos( cierreCaja),
    idCajaAbierta : tryCatchDatos( idCajaAbierta ),
    metricasCaja : tryCatchDatos( metricaPanelPrincipal ),
};