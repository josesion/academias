import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { EstadoCajaInput,  InputConvinados, LibroDiarioInput} from "../squemas/listaCajas";


export interface DataEstadoResult{
      id_caja : number, 
      cajero : string,
      fecha_apertura : string,
      hora_apertura : string,
      estado : "abierta" | "cerrada",
      total : number,
      totales : {
         efectivo : number,
         virtual  : number
      }
};


/**
 * Obtiene el estado actual de las cajas abiertas de una escuela, incluyendo 
 * el cajero que la abrió, la fecha/hora, el total acumulado y un desglose 
 * detallado de los montos por cuenta (efectivo, virtual, etc.) en formato JSON.
 *
 * @async
 * @function listaEstadoCaja
 * @param {EstadoCajaInput} id_escuela - Objeto que contiene el ID de la escuela a consultar (`id_escuela.id_escuela`).
 * @returns {Promise<TipadoData<DataEstadoResult>>} Una promesa que resuelve con la estructura estándar de respuesta (`TipadoData`) 
 *          que contiene los datos del estado de la caja (`DataEstadoResult`).
 * 
 * @throws {Error} Lanza un error si la consulta SQL falla o si hay problemas de conexión con la base de datos.
 * 
 * @example
 * // Uso típico dentro de un controlador de Express
 * const resultado = await listaEstadoCaja({ id_escuela: 1 });
 */
const listaEstadoCaja = async( id_escuela : EstadoCajaInput)
:Promise<TipadoData<DataEstadoResult>> =>{

    const sql : string = `SELECT 
                            c.id_caja,
                            CONCAT(u.nombre, ' ', u.apellido) AS cajero,
                            DATE_FORMAT(c.fecha_apertura, '%Y-%m-%d') AS fecha_apertura,
                            DATE_FORMAT(c.fecha_apertura, '%H:%i:%s') AS hora_apertura,
                            c.estado,
                            COALESCE(SUM(dc.monto), 0.00) AS total,
                            JSON_OBJECT(
                                'efectivo', COALESCE(SUM(CASE WHEN ce.tipo_cuenta = 'fisico' THEN dc.monto ELSE 0 END), 0.00),
                                'virtual', COALESCE(SUM(CASE WHEN ce.tipo_cuenta = 'virtual' THEN dc.monto ELSE 0 END), 0.00)
                            ) AS totales
                        FROM cajas c
                        LEFT JOIN usuarios u ON c.id_usuario_apertura = u.id_usuario
                        LEFT JOIN detalle_caja dc ON c.id_caja = dc.id_caja
                        LEFT JOIN cuentas_escuela ce ON dc.id_cuenta = ce.id_cuenta
                        WHERE c.id_escuela = ? AND c.estado = 'abierta'
                        GROUP BY c.id_caja, u.nombre, u.apellido, c.fecha_apertura, c.estado;`;

    const valor : unknown[] = [ id_escuela.id_escuela ];

    return buscarExistenteEntidad({
        slqEntidad : sql, valores : valor , entidad : "ESTADO_CAJA"
    });
};



export interface HistorialCaja {
    id_caja: number;
    fecha: {
        apertura: string; 
        cierre: string;   
    };
    hora: {
        apertura: string; 
        cierre: string;   
    };
    observaciones: string | null;
    monto_sistema: number;
    monto_real: number;
    monto_faltante: number;
    /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
    usuario_apertura: string;
    /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
    usuario_cierre: string;
};

interface ResultDataListadoCajas {
    id_caja: number;
    fecha_apertura: string; // Formato 'YYYY-MM-DD'
    hora_apertura: string;  // Formato 'HH:mm:ss'
    fecha_cierre: string;   // Formato 'YYYY-MM-DD'
    hora_cierre: string;    // Formato 'HH:mm:ss'
    monto_sistema: number;
    monto_final_real: number;
    diferencia_total: number;
    observaciones: string | null;  
    usuario_apertura: string;
    usuario_cierre: string;
};


/**
 * Obtiene el historial paginado de cajas cerradas de una escuela, permitiendo filtrar 
 * por rango de fechas, usuario responsable del cierre y estado de diferencia (exacta o con diferencia).
 *
 * Cada fila incluye **quién abrió y quién cerró** la caja (`usuario_apertura` y
 * `usuario_cierre`), resueltos en SQL como `nombre + apellido`, con fallback al
 * correo (`usuarios.usuario`) y, si no hay nada, a `"Sin usuario"` (spec 042 ·
 * Ampliación 2 · A3).
 *
 * @async
 * @function detalleCajasCerradas
 * @param {InputConvinados} data - Objeto con los parámetros de búsqueda, paginación y filtros.
 * @param {number} data.id_escuela - ID de la escuela a consultar.
 * @param {string} [data.fechaDesde] - Fecha inicial del rango (YYYY-MM-DD).
 * @param {string} [data.fechaHasta] - Fecha final del rango (YYYY-MM-DD).
 * @param {number|null} [data.idUsuarioFiltro] - ID del usuario de cierre para filtrar, o null para todos.
 * @param {string|null} [data.estadoDiferencia] - Filtro de diferencia ('exacta', 'con_diferencia' o null).
 * @param {number} data.limit - Cantidad de registros por página.
 * @param {number} data.pagina - Número de página actual.
 * @param {number} data.offset - Desplazamiento para la consulta SQL.
 * 
 * @returns {Promise<TipadoData<HistorialCaja[]>>} Promesa que resuelve con la estructura de datos 
 *          estándar conteniendo el listado del historial (con `usuario_apertura` y `usuario_cierre`)
 *          y la paginación.
 * 
 * @example
 * const historial = await detalleCajasCerradas({
 *     id_escuela: 1,
 *     fechaDesde: '2026-04-01',
 *     fechaHasta: '2026-04-30',
 *     idUsuarioFiltro: null,
 *     estadoDiferencia: null,
 *     limit: 10,
 *     pagina: 1,
 *     offset: 0
 * });
 */
const detalleCajasCerradas = async ( data : InputConvinados )
:Promise<TipadoData<HistorialCaja[]>> =>{

    const { idUsuarioFiltro, estadoDiferencia, fechaDesde, fechaHasta , limit, pagina, offset, id_escuela} = data;
    
    const slq : string =  `SELECT 
                                c.id_caja,
                                DATE_FORMAT(c.fecha_apertura, '%Y-%m-%d') AS fecha_apertura,
                                TIME_FORMAT(c.fecha_apertura, '%H:%i:%s') AS hora_apertura,
                                DATE_FORMAT(c.fecha_cierre, '%Y-%m-%d') AS fecha_cierre,
                                TIME_FORMAT(c.fecha_cierre, '%H:%i:%s') AS hora_cierre,
                                c.monto_sistema,
                                c.monto_final_real,
                                c.diferencia_total,
                                c.observaciones_cierre,
                                COALESCE(NULLIF(TRIM(CONCAT(IFNULL(ua.nombre,''), ' ', IFNULL(ua.apellido,''))), ''), ua.usuario, 'Sin usuario') AS usuario_apertura,
                                COALESCE(NULLIF(TRIM(CONCAT(IFNULL(uc.nombre,''), ' ', IFNULL(uc.apellido,''))), ''), uc.usuario, 'Sin usuario') AS usuario_cierre,
                                COUNT(*) OVER() AS total_registros
                            FROM cajas c
                            LEFT JOIN usuarios ua ON c.id_usuario_apertura = ua.id_usuario
                            LEFT JOIN usuarios uc ON c.id_usuario_cierre = uc.id_usuario
                            WHERE c.id_escuela = ?
                            AND c.estado = 'cerrada' -- 1. Excluimos la abierta
                            AND DATE(c.fecha_cierre) BETWEEN ? AND ? -- 2. Busqueda entre rangos de  fecha
                            AND (c.id_usuario_cierre = ? OR ? IS NULL)  -- 3. valido si es q busco por un usuario o todos 
                            AND (
                                ( ? = 'exacta' AND c.diferencia_total = 0) OR 
                                ( ? = 'con_diferencia' AND c.diferencia_total != 0) OR 
                                ( ? IS NULL)   -- 4 Busqueda con 3  de diferencia en la caj 
                            )
                            ORDER BY c.fecha_cierre DESC
                                    limit  ${limit} 
                                    OFFSET ${offset};`;

    const valores : unknown[] = [ 
            id_escuela, 
            fechaDesde, 
            fechaHasta, 
            idUsuarioFiltro, 
            idUsuarioFiltro,
            estadoDiferencia,
            estadoDiferencia,
            estadoDiferencia
        ];
       


    const result = await listarEntidad<ResultDataListadoCajas>({
        slqListado : slq,
        limit : limit,
        pagina : String(pagina),
        valores,
        entidad : "Historial_cajas",
        estado : "cerradas"
    });  

  
    if ( result.code === 'NO_ACTIVE_HISTORIAL_CAJAS' ){
        return{
            error : true,
            message : "Sin historial de cajas.",
            code : 'NO_ACTIVE_HISTORIAL_CAJAS' 
        };
    };

    if ( result.code === 'HISTORIAL_CAJAS_LISTED' && Array.isArray(result.data) ){
          const data: HistorialCaja[] = result.data.map(( items )=>{
                return {
                    id_caja: items.id_caja,
                    fecha: {
                        apertura: items.fecha_apertura,
                        cierre: items.fecha_cierre
                    },
                    hora: {
                        apertura: items.hora_apertura,
                        cierre: items.hora_cierre
                    },
                    observaciones: items.observaciones ? items.observaciones : "",
                    monto_sistema: items.monto_sistema,
                    monto_real: items.monto_final_real,
                    monto_faltante: items.diferencia_total,
                    usuario_apertura: items.usuario_apertura,
                    usuario_cierre: items.usuario_cierre
            };         
    });




        
    return {
            error : false,
            message : "Listado de historial de cajas cerradas.",
            data : data  ,
            paginacion : result.paginacion,
            code : 'HISTORIAL_CAJAS_CERRADAS'
    };

    };
    
return {
    error : true,
    message : "Error en el servidor, historial cajas cerradas.",
    code : "ERROR_SERVIDOR"
};


};


export interface DataResultMetodosPagos {
    id_cuenta : number,
    metodo : string,
    /**
     * Saldo por cuenta (ingresos − egresos, **incluye** el "Saldo Inicial").
     *
     * En el endpoint del **listado** (`metricasMetodoPagoCajas`) es la Σ de los
     * saldos finales de las cajas que pasan los filtros; en el del **libro
     * diario** (`graficosMetodosPagoCaja`) es el saldo de esa caja (spec 042 ·
     * Ampliación 3 · A4).
     */
    total : number,
    /**
     * Dinero que **circuló** por la cuenta (ingresos − egresos, **excluye** el
     * "Saldo Inicial"). Campo **nuevo** (spec 042 · Ampliación 3 · A4).
     *
     * Ojo: sólo lo devuelve el endpoint del **listado**
     * (`metricasMetodoPagoCajas`); el del **libro diario** no lo manda.
     */
    flujo : number,
}

/**
 * Obtiene las métricas por cada método de pago (cuenta) de las **cajas
 * cerradas** que entran en los filtros, aplicando los mismos criterios que el
 * listado (rango de `fecha_cierre`, usuario que cerró la caja y estado de
 * diferencia).
 *
 * El gráfico se deriva de las **mismas cajas que muestra el listado** (y no
 * de los movimientos sueltos del rango), para que la lista y el gráfico nunca
 * se contradigan: si una caja se abrió un día y se cerró otro, ambos aparecen
 * o ninguno (spec 041).
 *
 * Devuelve **dos** métricas por cuenta (spec 042 · Ampliación 3 · A4), con el
 * mismo patrón que `listaMetricasCaja` (`server/src/data/caja.data.ts`):
 *
 * - `total` = **saldo** por cuenta (ingresos − egresos, **incluye** el
 *   "Saldo Inicial"). ⚠️ **Cambió de significado**: antes era el *flujo*.
 *   Sus únicos consumidores son el gráfico del listado y los colores por
 *   índice (`cliente/src/pagina/privado/ListadoCajas/ListadoCajas.tsx` y
 *   `cliente/src/hooks/ListadoCajas/ListadoCajasBase.ts`).
 * - `flujo` = **dinero que circuló** por la cuenta (ingresos − egresos,
 *   **excluye** el "Saldo Inicial"). Campo **nuevo**.
 *
 * Como el filtro `cc.nombre_categoria != 'Saldo Inicial'` **ya no está** en el
 * `WHERE`, los métodos que sólo tienen "Saldo Inicial" **también aparecen**,
 * con `flujo = 0`.
 *
 * @async
 * @function metricasMetodoPagoCajas
 * @param {InputConvinados} data - Objeto que contiene los parámetros de filtrado.
 * @param {number} data.id_escuela - ID de la escuela a consultar.
 * @param {string} data.fechaDesde - Fecha inicial del rango de cajas cerradas (YYYY-MM-DD).
 * @param {string} data.fechaHasta - Fecha final del rango de cajas cerradas (YYYY-MM-DD).
 * @param {number|null} [data.idUsuarioFiltro] - ID del usuario que cerró la caja, o null para incluir todas.
 * @param {string|null} [data.estadoDiferencia] - Filtro de diferencia de caja ('exacta', 'con_diferencia' o null).
 *
 * @returns {Promise<TipadoData<DataResultMetodosPagos[]>>} Promesa que resuelve con la estructura de datos
 *          estándar conteniendo el listado de métricas por método de pago sin paginación
 *          (cada ítem con `total` = saldo y `flujo` = dinero que circuló).
 *
 * @example
 * const metricas = await metricasMetodoPagoCajas({
 *     id_escuela: 1,
 *     fechaDesde: '2026-04-01',
 *     fechaHasta: '2026-04-30',
 *     idUsuarioFiltro: null,
 *     estadoDiferencia: null
 * });
 */
const metricasMetodoPagoCajas =async (  data :  InputConvinados)
:Promise<TipadoData<DataResultMetodosPagos[]>> => {

    const { id_escuela , fechaDesde, fechaHasta, idUsuarioFiltro, estadoDiferencia } = data;

    const sql : string = `SELECT
                                ce.id_cuenta,
                                ce.nombre_cuenta AS metodo,
                                -- Saldo por cuenta (incluye el Saldo Inicial)
                                COALESCE(
                                    SUM(
                                        CASE
                                            WHEN cc.tipo_movimiento = 'ingreso' THEN dc.monto
                                            WHEN cc.tipo_movimiento = 'egreso' THEN -dc.monto
                                            ELSE 0
                                        END
                                    ), 0
                                ) AS total,
                                -- Dinero que circuló por la cuenta (excluye el Saldo Inicial)
                                COALESCE(
                                    SUM(
                                        CASE
                                            WHEN cc.tipo_movimiento = 'ingreso' AND cc.nombre_categoria <> 'Saldo Inicial' THEN dc.monto
                                            WHEN cc.tipo_movimiento = 'egreso' THEN -dc.monto
                                            ELSE 0
                                        END
                                    ), 0
                                ) AS flujo
                            FROM cajas c
                            INNER JOIN detalle_caja dc ON dc.id_caja = c.id_caja
                            INNER JOIN cuentas_escuela ce ON dc.id_cuenta = ce.id_cuenta
                            INNER JOIN categorias_caja cc ON dc.id_categoria = cc.id_categoria
                            WHERE c.id_escuela = ?
                                AND c.estado = 'cerrada'
                                AND DATE(c.fecha_cierre) BETWEEN ? AND ?  -- Mismo rango que el listado
                                AND (c.id_usuario_cierre = ? OR ? IS NULL)  -- Mismo criterio que el listado
                                AND (
                                    (? = 'exacta' AND c.diferencia_total = 0) OR
                                    (? = 'con_diferencia' AND c.diferencia_total != 0) OR
                                    (? IS NULL)
                                )
                            GROUP BY ce.id_cuenta, ce.nombre_cuenta, ce.tipo_cuenta
                            ORDER BY total DESC;`;

    const valores : unknown[] = [ 
        id_escuela, 
        fechaDesde, 
        fechaHasta, 
        idUsuarioFiltro, 
        idUsuarioFiltro,
        estadoDiferencia, 
        estadoDiferencia, 
        estadoDiferencia
    ];
    
    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores :valores,
        entidad : "METODOS_DATOS",
        estado : ""
    });

};


export interface CajasServicioResponse {
    dataDetalle: HistorialCaja[] | null;
    dataMetodo: DataResultMetodosPagos[] | null;
};

export interface ReturnUsuarioEscuelas {
    id_usuario : number,
    usuario   : string,
};


/**
 * Obtiene la lista de usuarios asociados a una escuela específica sin paginación.
 *
 * @async
 * @function usuarioEscuela
 * @param {EstadoCajaInput} id - Objeto de entrada que contiene el identificador de la escuela (`id_escuela`).
 * @returns {Promise<TipadoData<ReturnUsuarioEscuelas[]>>} Retorna una promesa con un objeto de tipo TipadoData:
 * - Si es exitoso (`error: false`): Devuelve un array con los usuarios de la escuela en la propiedad `data`.
 * - Si ocurre un error en la consulta: Devuelve `error: true` con su respectivo mensaje y código de error.
 */
const usuarioEscuela = async ( id : EstadoCajaInput)
:Promise<TipadoData<ReturnUsuarioEscuelas[]>> =>{

    const slq : string = `SELECT 
                                u.id_usuario,
                                u.usuario
                            FROM usuarios u
                            INNER JOIN escuelas e ON u.id_escuela = e.id_escuela
                            WHERE u.id_escuela = ?
                                    AND LOWER(u.rol) = 'usuario';`

    const valor : unknown[] = [ id.id_escuela ];
    
    return await listarEntidadSinPaginacion({
        slqListado : slq,
        valores : valor,
        entidad : "LISTA_USUARIOS_ESCUELA",
        estado : ""
    });

};


export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  categoria: string;
  descripcion: string | null;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
}

/**
 * Consulta y obtiene el detalle completo de los movimientos de una caja específica (incluyendo el saldo inicial) 
 * utilizando los joins correspondientes con usuarios, categorías y cuentas.
 *
 * @async
 * @function libroDiarioDetalle
 * @param {LibroDiarioInput} data - Objeto de entrada que contiene el identificador de la caja a consultar (`id_caja`).
 * @returns {Promise<TipadoData<MovimientoLibroDiario[]>>} Retorna una promesa con un objeto de tipo TipadoData:
 * - Si es exitoso (`error: false`): Devuelve la lista de movimientos del libro diario en la propiedad `data`.
 * - Si ocurre algún error o no hay registros: Retorna el estado de error correspondiente con su mensaje y código.
 */
const libroDiarioDetalle  = async ( data : LibroDiarioInput)
:Promise<TipadoData<MovimientoLibroDiario[]>>=> {

    const sql : string = `SELECT 
                            dc.id_movimiento,
                            CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                            dc.id_caja,
                            DATE_FORMAT(dc.fecha_movimiento, '%Y-%m-%d') AS fecha,
                            DATE_FORMAT(dc.fecha_movimiento, '%H:%i:%s') AS hora,
                            cc.nombre_categoria AS categoria,
                            dc.descripcion,
                            cc.tipo_movimiento AS tipo,
                            ce.nombre_cuenta AS cuenta,
                            dc.monto
                        FROM detalle_caja dc
                        INNER JOIN usuarios u ON dc.id_usuario = u.id_usuario
                        INNER JOIN categorias_caja cc ON dc.id_categoria = cc.id_categoria
                        INNER JOIN cuentas_escuela ce ON dc.id_cuenta = ce.id_cuenta
                        WHERE dc.id_caja = ?;`

    const valor : unknown[] = [ data.id_caja ];
    
    return listarEntidadSinPaginacion({
        slqListado : sql,
        valores : valor,
        entidad : "DETALLE_CAJA_RESUMEN",
        estado : ""
    });

}


/**
 * Consulta y obtiene el resumen de los montos por método de pago (cuenta)
 * para una caja específica, calculando el **saldo por cuenta**: ingresos menos
 * egresos **más** el saldo inicial de la cuenta.
 *
 * A diferencia de `metricasMetodoPagoCajas` (el gráfico **agregado** del
 * listado, que además calcula el `flujo`), acá **no** se excluye el saldo
 * inicial: así el gráfico del libro diario muestra exactamente el mismo
 * valor que la columna **"Sistema"** del arqueo (`saldo_final_cuenta`) —
 * spec 042 · Ampliación 2 · A1.
 *
 * ⚠️ Esta función **no** devuelve el campo `flujo` (sólo el `total` = saldo):
 * el único que lo trae es `metricasMetodoPagoCajas` (spec 042 · Ampliación 3 · A4).
 *
 * @async
 * @function graficosMetodosPagoCaja
 * @param {LibroDiarioInput} id - Objeto de entrada que contiene el identificador de la caja (`id_caja`).
 * @returns {Promise<TipadoData<DataResultMetodosPagos[]>>} Retorna una promesa con un objeto TipadoData:
 * - Si es exitoso (`error: false`): Devuelve la lista con los saldos por método de pago en la propiedad `data`.
 * - Si ocurre algún error o no hay registros: Retorna el estado de error correspondiente con su mensaje y código.
 */
const graficosMetodosPagoCaja =async ( id : LibroDiarioInput)
:Promise<TipadoData< DataResultMetodosPagos[]>> =>{

    const sql : string = `SELECT 
                                ce.id_cuenta,
                                ce.nombre_cuenta AS metodo,
                                COALESCE(
                                    SUM(
                                        CASE 
                                            WHEN cc.tipo_movimiento = 'ingreso' THEN dc.monto
                                            WHEN cc.tipo_movimiento = 'egreso' THEN -dc.monto
                                            ELSE 0
                                        END
                                    ), 0
                                ) AS total
                            FROM detalle_caja dc
                            INNER JOIN cuentas_escuela ce ON dc.id_cuenta = ce.id_cuenta
                            INNER JOIN categorias_caja cc ON dc.id_categoria = cc.id_categoria
                            WHERE dc.id_caja = ?
                            GROUP BY ce.id_cuenta, ce.nombre_cuenta, ce.tipo_cuenta
                            ORDER BY total DESC;`;

    const valor : unknown[] = [ id.id_caja ];

    return await listarEntidadSinPaginacion({
        slqListado : sql,
        valores : valor,
        entidad : "METODO_PAGOS_RESUMEN",
        estado : ""
    });
};


/**
 * Ítem del arqueo de una cuenta (método de pago) tal como se persistió en la
 * columna JSON `cajas.arqueo_detalle` al cerrar la caja.
 *
 * - `sistema`: lo que el sistema decía que había en esa cuenta
 *   (`saldo_final_cuenta`, incluye el saldo inicial de la cuenta).
 * - `real`: el conteo real que escribió el cajero al cerrar la caja.
 */
export interface ArqueoDetalleItem {
    id_cuenta : number;
    nombre_cuenta : string;
    sistema : number;
    real : number;
};

/**
 * Resumen del arqueo de una caja: el desglose por cuenta (`detalle`), los
 * totales de la caja con los que se puede contrastar el desglose y
 * **quién abrió y quién cerró** la caja (spec 042 · Ampliación 2 · A3).
 */
export interface ArqueoCajaResumen {
    detalle : ArqueoDetalleItem[];
    diferencia_total : number;
    monto_sistema : number;
    monto_final_real : number;
    /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
    usuario_apertura : string;
    /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
    usuario_cierre : string;
};

/**
 * Fila cruda de la tabla `cajas` para el arqueo. La columna `arqueo_detalle`
 * es `JSON NULL` y `mysql2` la parsea como array de objetos, pero se tipa como
 * `unknown` para normalizarla de forma defensiva.
 */
interface FilaArqueoCaja {
    arqueo_detalle : unknown;
    diferencia_total : number | string | null;
    monto_sistema : number | string | null;
    monto_final_real : number | string | null;
    usuario_apertura : string | null;
    usuario_cierre : string | null;
};

/**
 * Normaliza el contenido de la columna JSON `cajas.arqueo_detalle`.
 *
 * `mysql2` parsea las columnas JSON como array de objetos, pero la columna
 * puede venir `NULL` (caja abierta o cerrada sin arqueo) o con un tipo
 * inesperado (objeto, string). En cualquiera de esos casos se devuelve un
 * array vacío para no romper el endpoint.
 *
 * @param {unknown} valorCrudo - Contenido crudo de `cajas.arqueo_detalle`.
 * @returns {ArqueoDetalleItem[]} El desglose normalizado (array vacío si no hay dato válido).
 */
const normalizarDetalleArqueo = ( valorCrudo : unknown ) : ArqueoDetalleItem[] => {

    if ( !Array.isArray(valorCrudo) ){
        return [];
    };

    return valorCrudo.map( ( item : unknown ) => {

        const registro = ( item ?? {} ) as Partial<ArqueoDetalleItem>;

        return {
            id_cuenta : Number(registro.id_cuenta) || 0,
            nombre_cuenta : typeof registro.nombre_cuenta === "string" ? registro.nombre_cuenta : "",
            sistema : Number(registro.sistema) || 0,
            real : Number(registro.real) || 0
        };
    });

};


/**
 * Obtiene el arqueo de una caja: el desglose por cuenta guardado en
 * `cajas.arqueo_detalle` (el conteo real del cajero contra lo que decía el
 * sistema) junto con los totales de la caja (`diferencia_total`,
 * `monto_sistema` y `monto_final_real`).
 *
 * Además expone **quién abrió y quién cerró** la caja (`usuario_apertura` y
 * `usuario_cierre`, spec 042 · Ampliación 2 · A3). Se resuelven en SQL como
 * `nombre + apellido`, con fallback al correo (`usuarios.usuario`) y, si no
 * hay nada, a `"Sin usuario"`. Están disponibles **siempre que la caja
 * exista**, aunque `arqueo_detalle` sea `NULL` (caja abierta o cerrada sin
 * arqueo): en ese caso `detalle` viene `[]` pero los usuarios siguen ahí.
 *
 * La búsqueda usa el hook `buscarExistenteEntidad`, que **invierte** la
 * semántica: `error: true` con `code = "ARQUEO_DETALLE_CAJA_EXISTE"` significa
 * que la caja **existe** (y el dato viene en `data`); el código
 * `"ARQUEO_DETALLE_CAJA_NO_EXISTE"` significa que no hay caja con ese id.
 *
 * @async
 * @function arqueoDetalleCaja
 * @param {LibroDiarioInput} data - Objeto de entrada con el identificador de la caja (`id_caja`).
 * @returns {Promise<TipadoData<ArqueoCajaResumen>>} Retorna una promesa con un objeto TipadoData:
 * - Si la caja existe (`error: true`, `code: "ARQUEO_DETALLE_CAJA_EXISTE"`): Devuelve el arqueo normalizado en `data`.
 * - Si la caja no existe (`code: "ARQUEO_DETALLE_CAJA_NO_EXISTE"`): No hay `data`.
 *
 * @example
 * const arqueo = await arqueoDetalleCaja({ id_caja: 12 });
 */
const arqueoDetalleCaja = async ( data : LibroDiarioInput )
:Promise<TipadoData<ArqueoCajaResumen>> =>{

    const sql : string = `SELECT 
                            c.arqueo_detalle,
                            COALESCE(c.diferencia_total, 0) AS diferencia_total,
                            COALESCE(c.monto_sistema, 0) AS monto_sistema,
                            COALESCE(c.monto_final_real, 0) AS monto_final_real,
                            COALESCE(NULLIF(TRIM(CONCAT(IFNULL(ua.nombre,''), ' ', IFNULL(ua.apellido,''))), ''), ua.usuario, 'Sin usuario') AS usuario_apertura,
                            COALESCE(NULLIF(TRIM(CONCAT(IFNULL(uc.nombre,''), ' ', IFNULL(uc.apellido,''))), ''), uc.usuario, 'Sin usuario') AS usuario_cierre
                        FROM cajas c
                        LEFT JOIN usuarios ua ON c.id_usuario_apertura = ua.id_usuario
                        LEFT JOIN usuarios uc ON c.id_usuario_cierre = uc.id_usuario
                        WHERE c.id_caja = ?;`;

    const valores : unknown[] = [ data.id_caja ];

    const result = await buscarExistenteEntidad<FilaArqueoCaja>({
        slqEntidad : sql,
        valores : valores,
        entidad : "ARQUEO_DETALLE_CAJA"
    });

    if ( result.code === 'ARQUEO_DETALLE_CAJA_EXISTE' && result.data ){

        const fila : FilaArqueoCaja = result.data;

        return {
            error : result.error,
            message : result.message,
            data : {
                detalle : normalizarDetalleArqueo(fila.arqueo_detalle),
                diferencia_total : Number(fila.diferencia_total) || 0,
                monto_sistema : Number(fila.monto_sistema) || 0,
                monto_final_real : Number(fila.monto_final_real) || 0,
                usuario_apertura : fila.usuario_apertura ?? "Sin usuario",
                usuario_cierre : fila.usuario_cierre ?? "Sin usuario"
            },
            code : result.code
        };
    };

    return {
        error : result.error,
        message : result.message,
        code : result.code
    };

};


export interface CajasResumenResponse {
    dataDetalle: MovimientoLibroDiario[] | null;
    dataMetodo: DataResultMetodosPagos[] | null;
    dataArqueo: ArqueoCajaResumen | null;
};

export const method = {
    listaEstadoCaja : tryCatchDatos(listaEstadoCaja),
    detalleCajasCerradas : tryCatchDatos(detalleCajasCerradas),
    metricasMetodoPagoCajas : tryCatchDatos( metricasMetodoPagoCajas),
    usuarioEscuela : tryCatchDatos( usuarioEscuela),
    libroDiarioDetalle : tryCatchDatos( libroDiarioDetalle ),
    graficosMetodosPagoCaja : tryCatchDatos( graficosMetodosPagoCaja ),
    arqueoDetalleCaja : tryCatchDatos( arqueoDetalleCaja ),
};


