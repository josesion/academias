
// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import {  iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
// ──────────────────────────────────────────────────────────────
// Sección de  Typados
// ──────────────────────────────────────────────────────────────
import { VerificarCajaInputs, AbrirCajaInputs, 
         DetalleCajaInputs, CierreCajaInputs,
         IdCajaAbiertaInputs,ListaMovimientosCajaInputs,
         ListaCategoriaCajaTipoInputs, ListaTipoCuentasInputs,
         AperturaCajaInput, CierresCajaInputs,
         TransferenciaCajaInputs, RetencionCajaInputs,
         RetencionesActivasInputs
        } from "../squemas/cajas"; 
import { ResultAqueoCaja, DetalleCajaMovimiento ,CategoríaCaja,
         ResultTransferenciaCaja, ResultRetencionCaja,
         ResultResolverRetencion, RetencionActiva
       } from "../tipados/caja.data.tipado"; 
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
                                estado
                            ) VALUES (
                                ?,  -- id_escuela
                                ?,  -- id_usuario_apertura
                                'abierta'
                            );`; 
   const {id_escuela , id_usuario_apertura } = data;
   const valores : unknown[] = [id_escuela, id_usuario_apertura];
   const datosRetorno = {id_escuela ,  id_usuario_apertura};
   
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
                                -- Las retenciones devueltas quedan neutralizadas por estado (spec 050).
                                COALESCE(SUM(CASE 
                                    WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                    WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                    ELSE 0 END), 0) AS total_ingresos,
                                -- Sumamos egresos (si no hay, devuelve 0).
                                -- Las retenciones activas NO cuentan como gasto; sólo al justificarse.
                                COALESCE(SUM(CASE 
                                    WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                    WHEN det.estado_retencion = 'activa' THEN 0
                                    WHEN cat.tipo_movimiento = 'egreso' THEN det.monto 
                                    ELSE 0 END), 0) AS total_egresos,
                                -- BALANCE NETO: monto_inicial + (ingresos - egresos)
                                -- La retención devuelta no resta (se neutraliza por estado).
                                (c.monto_inicial + COALESCE(SUM(CASE 
                                    WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                    WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                    ELSE -det.monto END), 0)) AS balance_neto,
                                -- Lo mismo para tu validación de sistema
                                (c.monto_inicial + COALESCE(SUM(CASE 
                                    WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                    WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                    ELSE -det.monto END), 0)) AS monto_sistema_calculado
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
 * Ejecuta la sentencia SQL para actualizar y cerrar una caja en la base de datos.
 * * @async
 * @param {CierresCajaInputs} data - Objeto con toda la información validada del arqueo.
 * @returns {Promise<TipadoData<{ id_caja : number , estado : string}>>} 
 * Retorna el resultado de la operación MODIFICAR mediante iudEntidad.
 */
const cierreCaja = async (data: CierresCajaInputs): 
Promise<TipadoData<{ id_caja: number, estado: string }>> => {
    
    const sql: string = `UPDATE cajas 
                            SET 
                                id_usuario_cierre = ?,      
                                fecha_cierre = NOW(),        
                                monto_sistema = ?,           
                                monto_final_real = ?,        
                                diferencia_total = ?,        
                                arqueo_detalle = ?,          
                                observaciones_cierre = ?,    
                                estado = 'cerrada'           
                            WHERE 
                                id_caja = ?                  
                                AND estado = 'abierta';`;

    const { 
        id_usuario_cierre, 
        monto_final_real, 
        monto_sistema, 
        diferencia_total, 
        arqueo_detalle, 
        observaciones_cierre, 
        id_caja 
    } = data;

    const datosRetorno = { id_caja, estado: "cerrada" };

    // IMPORTANTE: arqueo_detalle debe ir como string JSON para que MySQL lo acepte correctamente
    const valores: unknown[] = [
        id_usuario_cierre, 
        monto_sistema,           
        monto_final_real, 
        diferencia_total, 
        JSON.stringify(arqueo_detalle), 
        observaciones_cierre, 
        id_caja
    ];

    return await iudEntidad({
        slqEntidad: sql,
        valores,
        metodo: "MODIFICAR",
        entidad: "CIERRE_CAJA",
        datosRetorno: datosRetorno
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
        let sql : string;
        let valores : unknown[];

        if (data.id_caja != null && data.id_caja > 0) {
            sql = `select id_caja from cajas c 
                     where c.estado = 'abierta' and c.id_escuela = ? and c.id_caja = ?;`;
            valores = [ data.id_escuela, data.id_caja ];
        } else {
            sql = `select id_caja from cajas c 
                     where c.estado = 'abierta' and c.id_escuela = ?;`;
            valores = [ data.id_escuela ];
        }

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
                            det.estado_retencion,
                            cat.nombre_categoria,
                            cat.tipo_movimiento, 
                            cue.nombre_cuenta,  
                            cue.tipo_cuenta,     
                            DATE_FORMAT(det.fecha_movimiento, '%Y-%m-%d') as fecha_grupo, 
                            TIME_FORMAT(det.fecha_movimiento, '%H:%i') as hora_formateada,
                            -- Traemos nombre y apellido combinados para el ticket
                            CONCAT(alu.nombre, ' ', alu.apellido) as nombre_alumno_vinculado
                        FROM detalle_caja det
                        INNER JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        INNER JOIN cuentas_escuela cue ON det.id_cuenta = cue.id_cuenta
                        -- Primer salto: hacia la inscripción
                        LEFT JOIN inscripciones ins ON det.referencia_id = ins.id_inscripcion 
                            AND det.referencia_id > 0
                        -- Segundo salto: hacia el alumno usando el DNI
                        LEFT JOIN alumnos alu ON ins.dni_alumno = alu.dni_alumno
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
                            and tipo_movimiento = ?
                            and categoria_sistema = 0;`;

    const valores : unknown[]  = [ id_escuela, estado, tipo];
    return await listarEntidadSinPaginacion<CategoríaCaja>({
        slqListado : sql,
        valores,
        entidad : "LISTA_CATEGORIA_CAJA_TIPO",
        estado : estado
    });
};

/**
 * Consulta la marca `categoria_sistema` de una categoría de caja.
 *
 * Se usa para impedir que el formulario genérico de ingreso/egreso registre
 * movimientos sobre categorías internas del sistema (spec 050). Igual que
 * `buscarExistenteEntidad`, **invierte** la semántica:
 * `error: true` + `code = "CATEGORIA_CAJA_EXISTE"` significa que la categoría existe.
 *
 * @param {number} id_categoria - Identificador de la categoría.
 * @returns {Promise<TipadoData<{ categoria_sistema: number }>>} Marca 0 (usuario) o 1 (sistema).
 */
export const categoriaSistemaCaja = async (id_categoria: number)
: Promise<TipadoData<{ categoria_sistema: number }>> => {

    const sql: string = `SELECT categoria_sistema
                         FROM categorias_caja
                         WHERE id_categoria = ?`;

    return await buscarExistenteEntidad<{ categoria_sistema: number }>({
        slqEntidad: sql,
        valores: [id_categoria],
        entidad: "CATEGORIA_CAJA"
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


/**
 * Obtiene el listado de tipos de cuentas financieras que participan activamente 
 * en una sesión de caja específica, basándose en los registros de detalles existentes.
 * 
 * @async
 * @function listaTipoCuentasSesion
 * @param {number} id_caja - Identificador único de la caja de la cual se quieren consultar las cuentas de la sesión.
 * @returns {Promise<TipadoData<{ id_cuenta: number, nombre_cuenta: string, tipo_cuenta: string }[]>>} Retorna una estructura con el estado de la operación, el mensaje, el código y un array con las cuentas válidas para esa sesión.
 */
const listaTipoCuentasSesion =async ( id_caja : number)
: Promise<TipadoData<{ id_cuenta :number, nombre_cuenta : string , tipo_cuenta : string}[]>> => {
   const sql : string =`SELECT 
                            cu.id_cuenta,
                            cu.nombre_cuenta,
                            cu.tipo_cuenta
                        FROM detalle_caja det
                        INNER JOIN cuentas_escuela cu ON det.id_cuenta = cu.id_cuenta
                        INNER JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        WHERE det.id_caja = ? 
                          AND cu.estado = 'activos'
                        GROUP BY det.id_cuenta, cu.nombre_cuenta, cu.tipo_cuenta;`
    const parametros : unknown[ ] = [ id_caja ];
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores : parametros,
        entidad : "LISTA_TIPO_CUENTAS",
        estado :  "SESION"
    });
};



/**
 * Obtiene el desglose financiero detallado por cada cuenta de la escuela para una sesión de caja específica.
 * * Realiza un cálculo agrupado (GROUP BY) que diferencia entre:
 * 1. inicial_cuenta: Monto con el que abrió la cuenta (Categoría 'Saldo Inicial').
 * 2. movimiento_sesion: Flujo neto de ingresos y egresos excluyendo la apertura.
 * 3. saldo_final_cuenta: El balance total actual (Sistema) que el usuario deberá auditar.
 *
 * @async
 * @param {CierreCajaInputs} data - Objeto que contiene el id_caja a consultar.
 * @returns {Promise<TipadoData<Array<{
 * id_cuenta: number | string,
 * nombre_cuenta: string,
 * inicial_cuenta: number,
 * movimiento_sesion: number,
 * saldo_final_cuenta: number
 * }>>>} Promesa con el array de métricas por cuenta para alimentar el componente de Arqueo.
 */
const listaMetricasCaja = async ( data : CierreCajaInputs)
: Promise<TipadoData<{
        id_cuenta: number | string;
        nombre_cuenta: string;
        tipo_cuenta: "fisico" | "virtual",
        inicial_cuenta: number;
        movimiento_sesion: number;
        saldo_final_cuenta: number;
}[]>> => {
    const { id_caja } = data ;
    const sql : string = `SELECT 
                            det.id_cuenta,
                            cu.nombre_cuenta,
                            cu.tipo_cuenta, -- <--- Agregamos el tipo (fisico/virtual)
                            -- Con cuánto arrancó la cuenta
                            COALESCE(SUM(CASE WHEN cat.nombre_categoria = 'Saldo Inicial' THEN det.monto ELSE 0 END), 0) AS inicial_cuenta,
                            
                            -- Movimientos puros de la sesión (Ingresos - Egresos)
                            -- La retención devuelta se neutraliza por estado (spec 050).
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' AND cat.nombre_categoria <> 'Saldo Inicial' THEN det.monto 
                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                ELSE 0 END), 0) AS movimiento_sesion,
                            
                            -- El total real que hay en la cuenta (Monto Sistema)
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                ELSE 0 END), 0) AS saldo_final_cuenta

                        FROM detalle_caja det
                        INNER JOIN cuentas_escuela cu ON det.id_cuenta = cu.id_cuenta
                        INNER JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        WHERE det.id_caja = ? 
                        GROUP BY det.id_cuenta, cu.nombre_cuenta, cu.tipo_cuenta;`;
    const parametros : unknown[] = [ id_caja ];

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
:Promise<TipadoData<{
            monto_inicial : number,
            total_ingresos : number,
            total_egresos  : number,
            flujo_dia : number,
            balance_neto  : number }[]>>=> {
    const { id_caja , id_escuela} = data ; 
    const slq : string = `SELECT 
                            -- 1. El monto inicial (Saldo que ya existía)
                            COALESCE(SUM(CASE 
                                WHEN cat.nombre_categoria = 'Saldo Inicial' THEN det.monto 
                                ELSE 0 
                            END), 0) AS monto_inicial,
                            
                            -- 2. Total Ingresos NETOS (Ingresos - Anulaciones/Devoluciones)
                            -- Las dos patas de una transferencia se reflejan acá (spec 050).
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' AND cat.nombre_categoria <> 'Saldo Inicial' THEN det.monto 
                                WHEN cat.tipo_movimiento = 'egreso' AND (cat.nombre_categoria LIKE '%Anulacion%' OR cat.nombre_categoria LIKE '%Devolucion%') THEN -det.monto
                                ELSE 0 
                            END), 0) AS total_ingresos,
                            
                            -- 3. Total Egresos REALES (Excluyendo anulaciones, solo gastos operativos)
                            -- La retención sólo cuenta como egreso cuando está justificada (spec 050).
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN det.estado_retencion = 'activa' THEN 0
                                WHEN cat.tipo_movimiento = 'egreso' AND cat.nombre_categoria NOT LIKE '%Anulacion%' AND cat.nombre_categoria NOT LIKE '%Devolucion%' THEN det.monto 
                                ELSE 0 
                            END), 0) AS total_egresos,

                            -- 4. FLUJO DEL DÍA (Ingresos Netos - Egresos Reales)
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' AND cat.nombre_categoria <> 'Saldo Inicial' THEN det.monto 
                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                ELSE 0 
                            END), 0) AS flujo_dia,
                            
                            -- 5. BALANCE NETO FINAL (Monto Inicial + Flujo Día)
                            COALESCE(SUM(CASE 
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto 
                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto 
                                ELSE 0 
                            END), 0) AS balance_neto

                        FROM cajas c
                        LEFT JOIN detalle_caja det ON c.id_caja = det.id_caja
                        LEFT JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                        WHERE c.id_caja = ? AND c.id_escuela = ?
                        GROUP BY c.id_caja;`;
    const  valores : unknown[] = [ id_caja , id_escuela];

    return  listarEntidadSinPaginacion({
        slqListado :slq,
        valores : valores,
        entidad : "METRICAS_PANEL",
        estado : "=)"
    });
};




/**
 * Realiza la transacción para la apertura de una caja, registrando el encabezado,
 * los detalles por cada cuenta/método de pago y calculando el monto total inicial.
 * 
 * @async
 * @function aperturaCajaTransaccion
 * @param {AperturaCajaInput} datos - Objeto con los datos necesarios para la apertura (id_escuela, id_usuario_apertura y detalle de cuentas/montos).
 * @returns {Promise<TipadoData<ResultAperturaCajas>>} Retorna una estructura con el estado de la transacción, un mensaje descriptivo, el código de resultado y los datos de la caja abierta (id_caja, montoTotal y categorías).
 * @throws {Error} Lanza un error si no se encuentra la categoría 'Saldo Inicial' configurada para la escuela.
 */
interface ListaMetodo {
    id_cuenta : number,
    metodo : string,
    monto  : number
};

export interface ResultAperturaCajas {
   id_caja : number, 
   montoTotal : number,
   categorias : ListaMetodo[] 
};

const aperturaCajaTransaccion = async (datos: AperturaCajaInput)
:Promise<TipadoData<ResultAperturaCajas>> => {
    // 1. Definición de Queries 
    const sqlCategoria: string = `SELECT id_categoria FROM categorias_caja 
                               WHERE id_escuela = ? AND nombre_categoria = 'Saldo Inicial' LIMIT 1`;

    const sqlCaja: string = `INSERT INTO cajas (id_escuela, id_usuario_apertura, estado) 
                             VALUES (?, ?, 'abierta')`;

    const sqlCajaDetalle: string = `INSERT INTO detalle_caja (
                                        id_caja, id_categoria, id_cuenta, id_usuario, 
                                        monto, descripcion, referencia_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const { id_escuela, id_usuario_apertura, detalle } = datos;

    // 2. Ejecución de la Transacción
    const resultado = await iudEntidadTransaction(async (conn) => {
        
        // PASO A: Obtener la categoría (Valores por separado)
        const valoresCat: unknown[] = [id_escuela];
        const [rowsCat]: any = await conn.execute(sqlCategoria, valoresCat);
        
        if (rowsCat.length === 0) {
            throw new Error("No se encontró la categoría 'Saldo Inicial' para esta escuela.");
        }
        const idCatApertura = rowsCat[0].id_categoria;

        // PASO B: Crear la caja
        const valoresCaja: unknown[] = [id_escuela, id_usuario_apertura];
        const [resCaja] = await conn.execute(sqlCaja, valoresCaja);
        const idGenerado = (resCaja as any).insertId;

        // PASO C: Mapear e insertar detalles
        // Uso for...of para que el await funcione y la transacción sea segura
        let montoTotal : number = 0;
        const categorias: ListaMetodo[] = [];

        for (const item of detalle) {
            
            const respuestaMetodo : ListaMetodo = {
                id_cuenta : item.id_cuenta,
                metodo : item.nombre_cuenta,
                monto : item.monto
            };

            categorias.push(respuestaMetodo);

            const valoresDetalle: unknown[] = [
                idGenerado,           // id_caja
                idCatApertura,        // id_categoria
                item.id_cuenta,       // id_cuenta (dinámico desde el front)
                id_usuario_apertura,  // id_usuario
                item.monto,           // monto
                `Saldo inicial: ${item.nombre_cuenta}`, // descripcion
                null            // referencia_id
            ];

            await conn.execute(sqlCajaDetalle, valoresDetalle);
            montoTotal += item.monto;

        }

        return { id_caja: idGenerado, montoTotal, categorias};
    });

    // 3. Manejo de respuesta final
    if (resultado.code === "TRANSACCION_OK") {
        return {
            error: false,
            message: "Apertura de caja registrada correctamente",
            data: resultado.data  as ResultAperturaCajas,
            code: "TRANSACCION_OK"
        };
    }

    return {
        error: true,
        message: resultado.message || "Error en la apertura de caja",
        code: "TRANSACCION_FALLIDA"
    };
};


// ============================================================
// Spec 050 — Transferencias internas y Retenciones en caja
// ============================================================

/**
 * Calcula el saldo real de una cuenta dentro de una caja.
 *
 * - Retención `devuelta` ⇒ **no resta** (se neutraliza por estado).
 * - Retención `activa` o `justificada` ⇒ resta.
 * - Transferencias: la salida resta y la entrada suma; neto 0 en la caja.
 *
 * @param conn - Conexión de la transacción en curso.
 * @param id_caja - Caja a consultar.
 * @param id_cuenta - Cuenta de la escuela.
 * @returns {Promise<number>} Saldo actual de la cuenta en esa caja.
 */
const saldoCuentaTransaccion = async (
    conn: any,
    id_caja: number,
    id_cuenta: number
): Promise<number> => {
    const sql: string = `SELECT COALESCE(SUM(CASE
                                WHEN COALESCE(det.estado_retencion, '') = 'devuelta' THEN 0
                                WHEN cat.tipo_movimiento = 'ingreso' THEN det.monto
                                WHEN cat.tipo_movimiento = 'egreso' THEN -det.monto
                                ELSE 0 END), 0) AS saldo
                            FROM detalle_caja det
                            INNER JOIN categorias_caja cat ON det.id_categoria = cat.id_categoria
                            WHERE det.id_caja = ? AND det.id_cuenta = ?`;

    const [rows]: any = await conn.execute(sql, [id_caja, id_cuenta]);
    return Number(rows[0]?.saldo ?? 0);
};

/**
 * Registra una transferencia interna entre dos cuentas de la misma escuela.
 *
 * Inserta una fila en `transferencias_caja` y **dos** movimientos vinculados:
 * un egreso en la cuenta de origen (`Transferencia Salida`) y un ingreso en la
 * cuenta de destino (`Transferencia Entrada`). Todo ocurre en una única
 * transacción, así que el balance total de la caja se mantiene en cero.
 *
 * @param {TransferenciaCajaInputs} datos - Caja, cuentas, monto y descripción.
 * @returns {Promise<TipadoData<ResultTransferenciaCaja>>} IDs de la transferencia y de sus dos patas.
 * @throws {Error} Si la caja no está abierta, las cuentas no son válidas, el saldo no alcanza o faltan las categorías de sistema.
 */
export const transferenciaEntreCuentasTransaccion = async (datos: TransferenciaCajaInputs)
: Promise<TipadoData<ResultTransferenciaCaja>> => {

    const {
        id_escuela, id_usuario, id_caja,
        id_cuenta_origen, id_cuenta_destino, monto, descripcion
    } = datos;

    const resultado = await iudEntidadTransaction(async (conn) => {

        // 1. Caja abierta y de la escuela.
        const [rowsCaja]: any = await conn.execute(
            `SELECT id_caja FROM cajas
             WHERE id_caja = ? AND id_escuela = ? AND estado = 'abierta'
             FOR UPDATE`,
            [id_caja, id_escuela]
        );
        if (rowsCaja.length === 0) {
            throw new Error("CAJA_NO_ABIERTA");
        }

        // 2. Cuentas activas de la escuela (bloquea las filas para serializar transferencias).
        const [rowsCuentas]: any = await conn.execute(
            `SELECT id_cuenta, nombre_cuenta FROM cuentas_escuela
             WHERE id_escuela = ? AND estado = 'activos' AND id_cuenta IN (?, ?)
             FOR UPDATE`,
            [id_escuela, id_cuenta_origen, id_cuenta_destino]
        );

        const cuentas = rowsCuentas as { id_cuenta: number; nombre_cuenta: string }[];
        const cuentaOrigen = cuentas.find((c) => Number(c.id_cuenta) === Number(id_cuenta_origen));
        const cuentaDestino = cuentas.find((c) => Number(c.id_cuenta) === Number(id_cuenta_destino));

        if (!cuentaOrigen || !cuentaDestino) {
            throw new Error("CUENTA_INVALIDA");
        }

        // 3. Saldo suficiente en la cuenta de origen.
        const saldoOrigen = await saldoCuentaTransaccion(conn, id_caja, id_cuenta_origen);
        if (saldoOrigen < Number(monto)) {
            throw new Error("SIN_SALDO");
        }

        // 4. Categorías de sistema de la transferencia.
        const [rowsCat]: any = await conn.execute(
            `SELECT id_categoria, nombre_categoria FROM categorias_caja
             WHERE id_escuela = ?
               AND nombre_categoria IN ('Transferencia Salida', 'Transferencia Entrada')`,
            [id_escuela]
        );

        const categorias = rowsCat as { id_categoria: number; nombre_categoria: string }[];
        const catSalida = categorias.find((c) => c.nombre_categoria === "Transferencia Salida");
        const catEntrada = categorias.find((c) => c.nombre_categoria === "Transferencia Entrada");

        if (!catSalida || !catEntrada) {
            throw new Error("CATEGORIAS_TRANSFERENCIA_FALTAN");
        }

        const descripcionBase = descripcion?.trim() || "Transferencia entre cuentas";

        // 5. Fila de vínculo.
        const [resTransferencia]: any = await conn.execute(
            `INSERT INTO transferencias_caja (
                id_escuela, id_caja, id_cuenta_origen, id_cuenta_destino,
                monto, id_usuario, descripcion
             ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_escuela, id_caja, id_cuenta_origen, id_cuenta_destino, monto, id_usuario, descripcionBase]
        );
        const idTransferencia = Number(resTransferencia.insertId);

        const sqlDetalle: string = `INSERT INTO detalle_caja (
                                        id_caja, id_categoria, id_cuenta, id_usuario,
                                        monto, descripcion, referencia_id, id_transferencia
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        // 6. Pata de egreso (origen).
        const [resEgreso]: any = await conn.execute(sqlDetalle, [
            id_caja,
            catSalida.id_categoria,
            id_cuenta_origen,
            id_usuario,
            monto,
            `Transferencia a ${cuentaDestino.nombre_cuenta}: ${descripcionBase}`,
            null,
            idTransferencia
        ]);
        const idMovimientoEgreso = Number(resEgreso.insertId);

        // 7. Pata de ingreso (destino).
        const [resIngreso]: any = await conn.execute(sqlDetalle, [
            id_caja,
            catEntrada.id_categoria,
            id_cuenta_destino,
            id_usuario,
            monto,
            `Transferencia desde ${cuentaOrigen.nombre_cuenta}: ${descripcionBase}`,
            null,
            idTransferencia
        ]);
        const idMovimientoIngreso = Number(resIngreso.insertId);

        return {
            id_transferencia: idTransferencia,
            id_movimiento_egreso: idMovimientoEgreso,
            id_movimiento_ingreso: idMovimientoIngreso
        };
    });

    if (resultado.code === "TRANSACCION_OK" && resultado.data) {
        return {
            error: false,
            message: "Transferencia registrada correctamente",
            data: resultado.data,
            code: "TRANSFERENCIA_OK"
        };
    }

    return {
        error: true,
        message: resultado.message || "No se pudo registrar la transferencia",
        code: "TRANSFERENCIA_ERROR"
    };
};

/**
 * Registra una retención de efectivo como egreso con `estado_retencion = 'activa'`.
 *
 * Mientras está activa resta del saldo de la cuenta pero no cuenta como gasto.
 *
 * @param {RetencionCajaInputs} datos - Caja, cuenta, monto y descripción.
 * @returns {Promise<TipadoData<ResultRetencionCaja>>} ID del movimiento creado y estado inicial.
 * @throws {Error} Si la caja no está abierta, la cuenta no es válida, el saldo no alcanza o falta la categoría `Retención`.
 */
export const registrarRetencionTransaccion = async (datos: RetencionCajaInputs)
: Promise<TipadoData<ResultRetencionCaja>> => {

    const { id_escuela, id_usuario, id_caja, id_cuenta, monto, descripcion } = datos;

    const resultado = await iudEntidadTransaction(async (conn) => {

        // 1. Caja abierta y de la escuela.
        const [rowsCaja]: any = await conn.execute(
            `SELECT id_caja FROM cajas
             WHERE id_caja = ? AND id_escuela = ? AND estado = 'abierta'
             FOR UPDATE`,
            [id_caja, id_escuela]
        );
        if (rowsCaja.length === 0) {
            throw new Error("CAJA_NO_ABIERTA");
        }

        // 2. Cuenta activa de la escuela.
        const [rowsCuenta]: any = await conn.execute(
            `SELECT id_cuenta FROM cuentas_escuela
             WHERE id_escuela = ? AND estado = 'activos' AND id_cuenta = ?
             FOR UPDATE`,
            [id_escuela, id_cuenta]
        );
        if (rowsCuenta.length === 0) {
            throw new Error("CUENTA_INVALIDA");
        }

        // 3. Saldo suficiente: la retención saca plata de la caja.
        const saldo = await saldoCuentaTransaccion(conn, id_caja, id_cuenta);
        if (saldo < Number(monto)) {
            throw new Error("SIN_SALDO");
        }

        // 4. Categoría de sistema `Retención`.
        const [rowsCat]: any = await conn.execute(
            `SELECT id_categoria FROM categorias_caja
             WHERE id_escuela = ? AND nombre_categoria = 'Retención'
               AND tipo_movimiento = 'egreso'
             LIMIT 1`,
            [id_escuela]
        );
        if (rowsCat.length === 0) {
            throw new Error("CATEGORIA_RETENCION_FALTA");
        }
        const idCategoria = Number((rowsCat as { id_categoria: number }[])[0].id_categoria);

        // 5. Egreso "neutro" (activo hasta que se devuelva o justifique).
        const [resDetalle]: any = await conn.execute(
            `INSERT INTO detalle_caja (
                id_caja, id_categoria, id_cuenta, id_usuario,
                monto, descripcion, referencia_id, estado_retencion
             ) VALUES (?, ?, ?, ?, ?, ?, ?, 'activa')`,
            [
                id_caja,
                idCategoria,
                id_cuenta,
                id_usuario,
                monto,
                descripcion?.trim() || "Retención de efectivo",
                null
            ]
        );

        return {
            id_movimiento: Number(resDetalle.insertId),
            monto: Number(monto),
            estado_retencion: "activa" as const
        };
    });

    if (resultado.code === "TRANSACCION_OK" && resultado.data) {
        return {
            error: false,
            message: "Retención registrada correctamente",
            data: resultado.data,
            code: "RETENCION_OK"
        };
    }

    return {
        error: true,
        message: resultado.message || "No se pudo registrar la retención",
        code: "RETENCION_ERROR"
    };
};

/**
 * Lista las retenciones que siguen `activas` en una caja.
 *
 * @param {RetencionesActivasInputs} datos - Caja a consultar (la escuela se valida en el servicio).
 * @returns {Promise<TipadoData<RetencionActiva[]>>} Retenciones activas con cuenta y fecha.
 */
export const listaRetencionesActivas = async (datos: RetencionesActivasInputs)
: Promise<TipadoData<RetencionActiva[]>> => {

    const sql: string = `SELECT
                            det.id_movimiento,
                            det.id_caja,
                            det.id_cuenta,
                            cue.nombre_cuenta,
                            det.monto,
                            det.descripcion,
                            DATE_FORMAT(det.fecha_movimiento, '%Y-%m-%d') AS fecha_movimiento,
                            TIME_FORMAT(det.fecha_movimiento, '%H:%i') AS hora_formateada,
                            det.estado_retencion
                         FROM detalle_caja det
                         INNER JOIN cuentas_escuela cue ON det.id_cuenta = cue.id_cuenta
                         WHERE det.id_caja = ?
                           AND det.estado_retencion = 'activa'
                         ORDER BY det.fecha_movimiento DESC, det.id_movimiento DESC`;

    return await listarEntidadSinPaginacion<RetencionActiva>({
        slqListado: sql,
        valores: [datos.id_caja],
        entidad: "RETENCIONES_ACTIVAS",
        estado: "activas"
    });
};

/** Fila cruda de una retención para resolverla. */
export interface RetencionFila {
    id_movimiento: number;
    id_caja: number;
    id_cuenta: number;
    monto: number;
    estado_retencion: "activa" | "devuelta" | "justificada" | null;
    descripcion: string | null;
};

/**
 * Busca una retención por `id_movimiento` validando que pertenezca a la escuela
 * del token (a través de la caja).
 *
 * Usa `buscarExistenteEntidad`, que **invierte** la semántica:
 * `error: true` + `code = "RETENCION_EXISTE"` significa que la retención existe.
 *
 * @param id_movimiento - Movimiento de detalle de caja.
 * @param id_escuela - Escuela del token.
 * @returns {Promise<TipadoData<RetencionFila>>} Fila si existe, o `RETENCION_NO_EXISTE`.
 */
export const obtenerRetencion = async (id_movimiento: number, id_escuela: number)
: Promise<TipadoData<RetencionFila>> => {

    const sql: string = `SELECT
                            det.id_movimiento,
                            det.id_caja,
                            det.id_cuenta,
                            det.monto,
                            det.estado_retencion,
                            det.descripcion
                         FROM detalle_caja det
                         INNER JOIN cajas c ON det.id_caja = c.id_caja
                         WHERE det.id_movimiento = ? AND c.id_escuela = ?`;

    return await buscarExistenteEntidad<RetencionFila>({
        slqEntidad: sql,
        valores: [id_movimiento, id_escuela],
        entidad: "RETENCION"
    });
};

/** Datos ya validados por el servicio para resolver una retención. */
export interface ResolverRetencionData {
    id_movimiento: number;
    id_escuela: number;
    id_usuario: number;
    id_caja: number;
    id_cuenta: number;
    monto_original: number;
    monto_devuelto: number;
    estado: "devuelta" | "justificada";
    justificacion: string | null;
    aplicar_diferencia: boolean;
    descripcion_original: string | null;
};

/**
 * Resuelve una retención activa (devolución total, devolución parcial o
 * justificación) dentro de una transacción.
 *
 * - **Devolución total** (`monto_devuelto >= monto`): marca `devuelta`. La retención
 *   deja de restar del saldo y no aparece en el detalle de caja (se neutraliza por estado).
 * - **Devolución parcial** (`0 < monto_devuelto < monto`): marca `devuelta` y
 *   crea un egreso nuevo por la diferencia, `justificada`, con la observación
 *   obligatoria y `referencia_id` apuntando a la retención original. Solo la
 *   diferencia no devuelta aparece en el detalle.
 * - **Justificación** (sin devolución): marca `justificada`, guarda la
 *   observación y no crea movimientos.
 *
 * No se crea movimiento de ingreso al devolver porque el dinero ya estaba en la
 * cuenta (solo estaba retenido). Al cambiar el estado a `devuelta`, la fila original
 * se neutraliza en los cálculos de saldo y métricas.
 *
 * @param {ResolverRetencionData} datos - Datos validados por el servicio.
 * @returns {Promise<TipadoData<ResultResolverRetencion>>} Estado final y, si aplica, el ID del egreso por diferencia.
 * @throws {Error} Si la retención no existe, ya fue resuelta o falta la categoría `Retención`.
 */
export const resolverRetencionTransaccion = async (datos: ResolverRetencionData)
: Promise<TipadoData<ResultResolverRetencion>> => {

    const resultado = await iudEntidadTransaction(async (conn) => {

        // 1. Bloquea la retención y verifica que siga activa.
        const [rowsRet]: any = await conn.execute(
            `SELECT id_movimiento, id_caja, id_cuenta, monto, estado_retencion, descripcion
             FROM detalle_caja
             WHERE id_movimiento = ?
             FOR UPDATE`,
            [datos.id_movimiento]
        );

        if (rowsRet.length === 0) {
            throw new Error("RETENCION_NO_EXISTE");
        }

        const retencion = rowsRet[0] as RetencionFila;

        if (retencion.estado_retencion !== "activa") {
            throw new Error("RETENCION_YA_RESUELTA");
        }

        // 2. Actualiza la fila original (se neutraliza por estado si se devolvió).
        // La justificación se guarda en `descripcion` (campo único de texto).
        // Se guarda solo el texto que escribió el usuario, sin formato adicional.
        const nuevaDescripcion = datos.justificacion
            ? datos.justificacion
            : retencion.descripcion ?? null;

        await conn.execute(
            `UPDATE detalle_caja
                SET estado_retencion = ?, monto_devuelto = ?, descripcion = ?
              WHERE id_movimiento = ?`,
            [
                datos.estado,
                datos.monto_devuelto,
                nuevaDescripcion,
                datos.id_movimiento
            ]
        );

        let idMovimientoDiferencia: number | null = null;

        // 3. Devolución parcial: la diferencia queda como nueva retención activa.
        if (datos.aplicar_diferencia) {

            const diferencia = Number(datos.monto_original) - Number(datos.monto_devuelto);
            if (diferencia > 0) {

                const [rowsCat]: any = await conn.execute(
                    `SELECT id_categoria FROM categorias_caja
                     WHERE id_escuela = ? AND nombre_categoria = 'Retención'
                       AND tipo_movimiento = 'egreso'
                     LIMIT 1`,
                    [datos.id_escuela]
                );

                if (rowsCat.length === 0) {
                    throw new Error("CATEGORIA_RETENCION_FALTA");
                }

                const idCategoria = Number((rowsCat as { id_categoria: number }[])[0].id_categoria);

                const [resDiferencia]: any = await conn.execute(
                    `INSERT INTO detalle_caja (
                        id_caja, id_categoria, id_cuenta, id_usuario,
                        monto, descripcion, referencia_id,
                        estado_retencion, monto_devuelto
                     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'activa', 0)`,
                    [
                        datos.id_caja,
                        idCategoria,
                        datos.id_cuenta,
                        datos.id_usuario,
                        diferencia,
                        `Retención no devuelta: ${datos.justificacion ?? "sin observación"}`,
                        datos.id_movimiento
                    ]
                );

                idMovimientoDiferencia = Number(resDiferencia.insertId);
            }
        }

        return {
            id_movimiento: datos.id_movimiento,
            estado_retencion: datos.estado,
            monto_devuelto: datos.monto_devuelto,
            id_movimiento_diferencia: idMovimientoDiferencia
        };
    });

    if (resultado.code === "TRANSACCION_OK" && resultado.data) {
        return {
            error: false,
            message: "Retención resuelta correctamente",
            data: resultado.data,
            code: "RETENCION_RESUELTA"
        };
    }

    return {
        error: true,
        message: resultado.message || "No se pudo resolver la retención",
        code: "RETENCION_RESOLVER_ERROR"
    };
};


export const method = {
    verificarCajaAbierta : tryCatchDatos( verificarCajaAbierta ),
    abrirCaja  : tryCatchDatos( abrirCaja ),
    detalleCajaAlta : tryCatchDatos( detalleCajaAlta ),
    arqueoCaja   : tryCatchDatos( arqueoCaja ),
    cierreCaja   : tryCatchDatos( cierreCaja),
    idCajaAbierta : tryCatchDatos( idCajaAbierta ),
    listaMovimientosCaja : tryCatchDatos( listaMovimientosCaja ),
    listaCategiriaCajaTipos : tryCatchDatos( listaCategiriaCajaTipos),
    listaMetricasCaja : tryCatchDatos( listaMetricasCaja),
    listaTipoCuentas : tryCatchDatos(listaTipoCuentas),
    metricasPrincipal : tryCatchDatos(metricasPrincipal),
    aperturaCajaTransaccion : tryCatchDatos( aperturaCajaTransaccion ),
    listaTipoCuentasSesion : tryCatchDatos( listaTipoCuentasSesion ),
    // Spec 050 — transferencias y retenciones
    transferenciaEntreCuentasTransaccion : tryCatchDatos( transferenciaEntreCuentasTransaccion ),
    registrarRetencionTransaccion : tryCatchDatos( registrarRetencionTransaccion ),
    listaRetencionesActivas : tryCatchDatos( listaRetencionesActivas ),
    obtenerRetencion : tryCatchDatos( obtenerRetencion ),
    resolverRetencionTransaccion : tryCatchDatos( resolverRetencionTransaccion ),
    categoriaSistemaCaja : tryCatchDatos( categoriaSistemaCaja ),
};