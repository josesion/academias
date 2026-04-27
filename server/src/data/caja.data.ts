
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
// ──────────────────────────────────────────────────────────────
// Sección de  Typados
// ──────────────────────────────────────────────────────────────
import { VerificarCajaInputs, AbrirCajaInputs, 
         DetalleCajaInputs, CierreCajaInputs,
         IdCajaAbiertaInputs,ListaMovimientosCajaInputs,
         ListaCategoriaCajaTipoInputs, ListaTipoCuentasInputs  } from "../squemas/cajas"; 
import { ResultAqueoCaja, MetricaPanelPrincipal, DetalleCajaMovimiento ,CategoríaCaja} from "../tipados/caja.data.tipado"; 
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
 * Registra la apertura de una nueva sesión de caja para una escuela.
 * * @param {AbrirCajaInputs} data - Objeto con los datos de apertura.
 * @param {number} data.id_escuela - ID de la escuela a la que pertenece la caja.
 * @param {number} data.id_usuario - ID del usuario que realiza la apertura.
 * @param {number} data.monto_inicial - Cantidad de dinero con la que inicia la caja.
 * @param {number} data.id_cuenta_apertura - ID de la cuenta donde se encuentra el monto inicial (Efectivo, Mercado Pago, etc.).
 * * @returns {Promise<TipadoData<AbrirCajaInputs>>} Resultado de la operación de inserción.
 * @throws {Error} Si ocurre un fallo en la base de datos o violación de integridad.
 */
const abrirCaja = async( data : AbrirCajaInputs)


: Promise<TipadoData<AbrirCajaInputs>> => {

    const sql : string = `INSERT INTO cajas (
                                id_escuela, 
                                id_usuario_apertura, 
                                monto_inicial, 
                                id_cuenta_apertura, 
                                estado
                            ) VALUES (
                                ?,  -- id_escuela
                                ?,  -- id_usuario_apertura
                                ?,  -- monto_inicial (puede ser 0.00)
                                ?,  -- id_cuenta_apertura (ID de Efectivo, MP, etc.)
                                'abierta'
                            );`; 
   const {id_escuela , monto_inicial , id_usuario_apertura,id_cuenta_apertura} = data;
   const valores : unknown[] = [id_escuela, id_usuario_apertura, monto_inicial, id_cuenta_apertura];
   const datosRetorno = {id_escuela , monto_inicial, id_usuario_apertura, id_cuenta_apertura};
   
   return await iudEntidad<AbrirCajaInputs>({
        slqEntidad : sql,
        valores,
        metodo : "CREAR",
        entidad : "Abrir_Caja",
        datosRetorno : datosRetorno
   });
};


/**
 * Registra un nuevo movimiento de entrada o salida en el detalle de la caja.
 * * Inserta un registro vinculado a una caja abierta, especificando la categoría,
 * la cuenta de destino/origen y el usuario que realiza la operación.
 * * @async
 * @function detalleCajaAlta
 * @param {DetalleCajaInputs} data - Objeto con la información del movimiento.
 * @param {number} data.id_caja - ID de la caja activa donde se registra el movimiento.
 * @param {number} data.id_categoria - ID de la categoría (ej: Cuotas, Gastos, sueldos).
 * @param {number} data.id_cuenta - ID de la cuenta (ej: Caja Efectivo, Banco, Mercado Pago).
 * @param {number} data.id_usuario - ID del usuario que registra el movimiento.
 * @param {number} data.monto - Valor decimal del movimiento.
 * @param {string} data.descripcion - Comentario o nota libre sobre el movimiento.
 * @param {number|null} data.referencia_id - ID de referencia opcional (ej: id_inscripcion).
 * * @returns {Promise<TipadoData<DetalleCajaInputs>>} Promesa con el resultado de la inserción y los datos enviados.
 */
const detalleCajaAlta = async( data : DetalleCajaInputs) 
: Promise<TipadoData<DetalleCajaInputs>> =>{
    const sql : string = `INSERT INTO detalle_caja (
                                id_caja, 
                                id_categoria, 
                                id_cuenta, 
                                id_usuario, 
                                monto, 
                                descripcion, 
                                referencia_id
                            ) VALUES (
                                ?, -- id_caja
                                ?, -- id_categoria
                                ?, -- id_cuenta (ej: ID de 'Caja Efectivo' o 'Banco virtual')
                                ?, -- id_usuario (el que registra el movimiento)
                                ?, -- monto
                                ?, -- descripcion
                                ?  -- referencia_id
                            );`;
    const { id_caja, id_categoria, monto,id_cuenta ,id_usuario , descripcion, referencia_id} = data;                        
    const valores : unknown[] = [id_caja, id_categoria, id_cuenta, id_usuario  , monto,  descripcion, referencia_id];
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
                            
                            -- 2. Total del Día (Monto inicial + ingresos - egresos)
                            (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                                                ELSE 0 END), 0)) AS flujo_del_dia,

                            -- 3. Desglose por Método de Pago (CORREGIDO: Ahora descuentan egresos)
                            
                            -- Efectivo (Monto inicial + ingresos efectivo - egresos efectivo)
                            (c.monto_inicial + COALESCE(SUM(CASE WHEN det.metodo_pago = 'efectivo' AND cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                                                WHEN det.metodo_pago = 'efectivo' AND cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                                                ELSE 0 END), 0)) AS total_efectivo,
                            
                            -- Transferencia
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'transferencia' AND cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                            WHEN det.metodo_pago = 'transferencia' AND cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                            ELSE 0 END), 0) AS total_transferencia,

                            -- Débito
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'debito' AND cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                            WHEN det.metodo_pago = 'debito' AND cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                            ELSE 0 END), 0) AS total_debito,

                            -- Crédito
                            COALESCE(SUM(CASE WHEN det.metodo_pago = 'credito' AND cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                            WHEN det.metodo_pago = 'credito' AND cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                            ELSE 0 END), 0) AS total_credito,

                            -- 4. Balance Final de Caja
                            (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                                                ELSE 0 END), 0)) AS balance_total_real

                        FROM cajas c
                        LEFT JOIN detalle_caja det ON c.id_caja = det.id_caja
                        LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        WHERE c.id_caja = ? AND c.id_escuela = ?
                        GROUP BY c.id_caja, c.monto_inicial;`;
   const valores : unknown[] = [ data.id_caja, data.id_escuela];     
   return buscarExistenteEntidad({
        slqEntidad : slq,
        valores,
        entidad : "METRICAS_CAJA"
   });                 
};


/**
 * Ejecuta la actualización en la base de datos para cerrar una caja abierta.
 * * Esta función actualiza los montos finales, registra al usuario que realiza el cierre
 * y cambia el estado de la caja, siempre que pertenezca a la escuela indicada.
 * * @async
 * @function cierreCaja
 * @param {Object} data - Datos para el cierre de caja.
 * @param {number} data.id_caja - ID único de la caja a cerrar.
 * @param {number} data.monto_final_real - Monto físico reportado por el usuario.
 * @param {number} data.monto_sistema - Monto calculado automáticamente por el sistema.
 * @param {number} data.id_escuela - ID de la escuela para validar la pertenencia.
 * @param {number} data.id_usuario - ID del usuario que cierra (se guarda en id_usuario_cierre).
 * * @returns {Promise<TipadoData<{ id_caja : number, estado : string }>>} Promesa con el resultado de la modificación.
 * * @example
 * const resultado = await cierreCaja({ 
 * id_caja: 1, 
 * monto_final_real: 5500, 
 * monto_sistema: 5500, 
 * id_escuela: 1, 
 * id_usuario: 5 
 * });
 */
const cierreCaja =async ( data : { id_caja: number, monto_final_real: number, monto_sistema: number, id_escuela : number, id_usuario_cierre : number })
: Promise<TipadoData<{ id_caja : number , estado : string}>> => {
    console.log("aqui")
    const sql : string = `UPDATE cajas 
                          SET 
                                monto_sistema = ?, 
                                monto_final_real =  ?, 
                                id_usuario_cierre = ?, -- id usuario es el de quien cerro la caja 
                                estado = 'cerrada', 
                                fecha_cierre = CURRENT_TIMESTAMP
                          WHERE id_caja = ? AND  id_escuela = ?;`;
    const {id_caja , monto_final_real ,monto_sistema, id_usuario_cierre ,id_escuela} =data ;

    const datosRetorno = { id_caja , estado : "cerrada" }                        
    const valores : unknown[] = [ monto_sistema, monto_final_real, id_usuario_cierre , id_caja, id_escuela ];
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

/**
 * Obtiene el listado detallado de movimientos de una caja específica.
 * * Esta función realiza un JOIN entre el detalle de caja, las categorías y las cuentas
 * de la escuela para devolver información enriquecida, incluyendo nombres de cuentas 
 * y formatos de fecha/hora amigables para el frontend.
 *
 * @async
 * @function listaMovimientosCaja
 * @param {ListaMovimientosCajaInputs} data - Objeto de entrada.
 * @param {number} data.id_caja - ID de la caja a consultar.
 * @param {number} data.limite - Cantidad de registros por página (Sanitizado internamente).
 * @param {number} data.offset - Desplazamiento para la paginación (Sanitizado internamente).
 * * @returns {Promise<TipadoData<DetalleCajaMovimiento[]>>} Promesa con el array de movimientos formateados.
 * * @example
 * const movimientos = await listaMovimientosCaja({ id_caja: 1, limite: 10, offset: 0 });
 */
const listaMovimientosCaja = async ( data : ListaMovimientosCajaInputs)
: Promise<TipadoData<DetalleCajaMovimiento[]>> =>  {
    const { id_caja , limite , offset} = data;
     const sql : string = `SELECT 
                            det.id_movimiento,
                            det.monto,
                            det.descripcion,
                            det.referencia_id,
                            cat.nombre_categoria,
                            cat.tipo_movimiento, 
                            cue.nombre_cuenta,  
                            cue.tipo_cuenta,     
                            DATE_FORMAT(det.fecha_movimiento, '%Y-%m-%d') as fecha_grupo, 
                            TIME_FORMAT(det.fecha_movimiento, '%H:%i') as hora_formateada
                        FROM detalle_caja det
                        INNER JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        INNER JOIN cuentas_escuela cue ON det.id_cuenta = cue.id_cuenta
                        WHERE det.id_caja = ?
                        ORDER BY det.fecha_movimiento DESC, det.id_movimiento DESC
                        LIMIT ${Number(limite)} OFFSET ${Number(offset)}; `;

     const valores : unknown[] = [ id_caja ];
     return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores,
        entidad : "LISTA_MOVIMIENTOS_CAJA",
        estado : "=)"
     });
};

/**
 * Obtiene el listado de categorías de caja filtradas por escuela, estado y tipo de movimiento.
 * * @async
 * @function listaCategiriaCajaTipos
 * @param {ListaCategoriaCajaTipoInputs} data - Objeto con los criterios de filtrado.
 * @param {number} data.id_escuela - ID de la escuela a la que pertenecen las categorías.
 * @param {string} data.tipo - El tipo de movimiento (ej: 'ingreso', 'egreso').
 * @param {string} data.estado - El estado de la categoría (ej: 'activo', 'inactivo').
 * * @returns {Promise<TipadoData<CategoríaCaja[]>>} Promesa que resuelve con un objeto tipado que contiene el array de categorías encontradas.
 * * @example
 * const categorias = await listaCategiriaCajaTipos({ 
 * id_escuela: 1, 
 * tipo: 'ingreso', 
 * estado: 'activo' 
 * });
 */
const listaCategiriaCajaTipos = async( data : ListaCategoriaCajaTipoInputs)
:Promise<TipadoData<CategoríaCaja[]>> => {
    const {id_escuela, tipo , estado} = data ; 

    const sql : string =`select * from categorias_caja 
                            where id_escuela =  ?
                            and estado = ?
                            and tipo_movimiento = ?;`;

    const valores : unknown[]  = [ id_escuela, estado, tipo];
    return await listarEntidadSinPaginacion<CategoríaCaja>({
        slqListado : sql,
        valores,
        entidad : "LISTA_CATEGORIA_CAJA_TIPO",
        estado : estado
    });
};

/**
 * Consulta la base de datos para obtener el listado de cuentas configuradas en la escuela.
 * * Este método accede directamente a la tabla `cuentas_escuela` filtrando por el estado 
 * y la escuela específica. Utiliza la utilidad `listarEntidadSinPaginacion` para 
 * ejecutar la query de forma segura.
 *
 * @async
 * @function listaTipoCuentas
 * @param {ListaTipoCuentasInputs} data - Objeto con los criterios de búsqueda.
 * @param {string} data.estado - Estado de las cuentas (ej. 'activos').
 * @param {number} data.id_escuela - ID de la escuela a la que pertenecen las cuentas.
 * @returns {Promise<TipadoData<{ id_cuenta: number, nombre_cuenta: string, tipo_cuenta: string }[]>>} 
 * Promesa que resuelve con un objeto de tipo `TipadoData` que contiene el array de cuentas.
 * * @example
 * const resultado = await listaTipoCuentas({ id_escuela: 114, estado: 'activos' });
 */
const listaTipoCuentas =async ( data : ListaTipoCuentasInputs)
: Promise<TipadoData<{ id_cuenta :number, nombre_cuenta : string , tipo_cuenta : string}[]>> => {
   const sql : string =`select 
                            id_cuenta, 
                            nombre_cuenta,
                            tipo_cuenta 
                        from 
                             cuentas_escuela 
                        where 
                            estado = ?
                        and 
                            id_escuela = ?;`
    const parametros : unknown[ ] = [ data.estado, data.id_escuela];
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores : parametros,
        entidad : "LISTA_TIPO_CUENTAS",
        estado : data.estado
    });
};


// a modifcar 
const listaMetricasCaja = async ( data : CierreCajaInputs) => {
    const { id_caja , id_escuela} = data ;
    const sql : string = `SELECT 
                            CASE WHEN GROUPING(cue.id_cuenta) = 1 THEN 'TOTAL' ELSE cue.id_cuenta END AS id_cuenta,
                            CASE WHEN GROUPING(cue.id_cuenta) = 1 THEN 'TOTAL GENERAL' ELSE MAX(cue.nombre_cuenta) END AS nombre_cuenta,
                            CASE WHEN GROUPING(cue.id_cuenta) = 1 THEN NULL ELSE MAX(cue.tipo_cuenta) END AS tipo_cuenta,
                            
                            -- Calculamos el saldo acumulado de movimientos
                            COALESCE(SUM(
                                CASE 
                                    WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                    WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                    ELSE 0 
                                END
                            ), 0) + 
                            -- Sumamos el monto inicial SOLO a la cuenta que corresponde
                            -- Usamos MAX para que el ROLLUP no multiplique el monto inicial en el TOTAL
                            IFNULL(MAX(CASE WHEN cue.id_cuenta = c.id_cuenta_apertura THEN c.monto_inicial ELSE 0 END), 0) AS saldo_actual

                        FROM cuentas_escuela cue
                        -- Traemos la caja específica una sola vez para toda la consulta
                        CROSS JOIN (SELECT * FROM cajas WHERE id_caja = ?) c
                        -- Unimos los movimientos filtrando por esa misma caja
                        LEFT JOIN detalle_caja det ON cue.id_cuenta = det.id_cuenta AND det.id_caja = c.id_caja
                        LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria

                        WHERE cue.id_escuela = ?
                        AND cue.estado = 'activos'
                        GROUP BY cue.id_cuenta WITH ROLLUP;`;
    const parametros : unknown[] = [ id_caja, id_escuela];

    return listarEntidadSinPaginacion({
        slqListado : sql,
        valores : parametros,
        entidad : "METRICAS_CAJA_CUENTAS",
        estado : "=)"
    });
};


/**
 * Ejecuta la consulta SQL para calcular las métricas financieras consolidadas de una caja.
 * Realiza el cálculo de ingresos, egresos y balance neto integrando el monto inicial.
 * * @async
 * @function metricasPrincipal
 * @param {CierreCajaInputs} data - Objeto con los identificadores necesarios (id_caja, id_escuela).
 * @returns {Promise<TipadoData<Array<{
 * monto_inicial: number,
 * total_ingresos: number,
 * total_egresos: number,
 * balence_neto: number,
 * monto_sistema_calculado: number
 * }>>>} Promesa con el resultado de la consulta SQL procesado por listarEntidadSinPaginacion.
 * * @description
 * La consulta utiliza LEFT JOIN para asegurar que se retornen valores incluso si la caja 
 * no posee movimientos registrados. El balance neto se calcula como:
 * Monto Inicial + Σ(Ingresos) - Σ(Egresos).
 */
const metricasPrincipal = async (  data : CierreCajaInputs ) 
: Promise<TipadoData<{
            monto_inicial : number,
            total_ingresos : number,
            total_egresos  : number,
            balance_neto  : number }[]>>=> {
    const { id_caja , id_escuela} = data ; 
    const slq : string = `SELECT 
                                c.monto_inicial ,
                                -- Sumamos ingresos (si no hay, devuelve 0)
                                COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto ELSE 0 END), 0) AS total_ingresos,
                                -- Sumamos egresos (si no hay, devuelve 0)
                                COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'egreso' THEN det.monto ELSE 0 END), 0) AS total_egresos,
                                -- BALANCE NETO: monto_inicial + (ingresos - egresos)
                                (c.monto_inicial + COALESCE(SUM(CASE WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                                                        WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                                                        ELSE 0 END), 0)) AS balance_neto
                            FROM cajas c
                            -- El LEFT JOIN es clave: trae la caja aunque no tenga filas en detalle_caja
                            LEFT JOIN detalle_caja det ON c.id_caja = det.id_caja
                            -- Segundo LEFT JOIN: para que si un detalle no tiene categoría, no rompa la suma
                            LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                            WHERE c.id_caja = ? and c.id_escuela = ?
                            GROUP BY c.id_caja, c.monto_inicial ;`;
    const  valores : unknown[] = [ id_caja , id_escuela];

    return  listarEntidadSinPaginacion({
        slqListado :slq,
        valores : valores,
        entidad : "METRICAS_PANEL",
        estado : "=)"
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
    listaMovimientosCaja : tryCatchDatos( listaMovimientosCaja ),
    listaCategiriaCajaTipos : tryCatchDatos( listaCategiriaCajaTipos),
    listaMetricasCaja : tryCatchDatos( listaMetricasCaja),
    listaTipoCuentas : tryCatchDatos(listaTipoCuentas),
    metricasPrincipal : tryCatchDatos(metricasPrincipal),
};