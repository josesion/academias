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
};


/**
 * Obtiene el historial paginado de cajas cerradas de una escuela, permitiendo filtrar 
 * por rango de fechas, usuario responsable del cierre y estado de diferencia (exacta o con diferencia).
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
 *          estándar conteniendo el listado del historial y la paginación.
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
                    monto_faltante: items.diferencia_total 
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
    total : number,
}

/**
 * Obtiene las métricas y el total acumulado por cada método de pago (cuenta) 
 * dentro de un rango de fechas, permitiendo filtrar opcionalmente por usuario 
 * y por el estado de diferencia de las cajas asociadas.
 *
 * @async
 * @function metricasMetodoPagoCajas
 * @param {InputConvinados} data - Objeto que contiene los parámetros de filtrado.
 * @param {number} data.id_escuela - ID de la escuela a consultar.
 * @param {string} data.fechaDesde - Fecha inicial del rango de movimientos (YYYY-MM-DD).
 * @param {string} data.fechaHasta - Fecha final del rango de movimientos (YYYY-MM-DD).
 * @param {number|null} [data.idUsuarioFiltro] - ID del usuario responsable del movimiento, o null para incluir a todos.
 * @param {string|null} [data.estadoDiferencia] - Filtro de diferencia de caja ('exacta', 'con_diferencia' o null).
 * 
 * @returns {Promise<TipadoData<DataResultMetodosPagos[]>>} Promesa que resuelve con la estructura de datos 
 *          estándar conteniendo el listado de métricas por método de pago sin paginación.
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
const metricasMetodoPagoCajas = (  data :  InputConvinados) 
:Promise<TipadoData<DataResultMetodosPagos[]>> => {

    const { id_escuela , fechaDesde, fechaHasta, idUsuarioFiltro, estadoDiferencia } = data;

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
                            INNER JOIN cajas c ON dc.id_caja = c.id_caja
                            INNER JOIN cuentas_escuela ce ON dc.id_cuenta = ce.id_cuenta
                            INNER JOIN categorias_caja cc ON dc.id_categoria = cc.id_categoria
                            WHERE c.id_escuela = ?
                                AND cc.nombre_categoria != 'Saldo Inicial' 
                                AND DATE(dc.fecha_movimiento) BETWEEN ? AND ? 
                                AND (dc.id_usuario = ? OR ? IS NULL)  -- Filtro de usuario opcional
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
    
    return listarEntidadSinPaginacion({
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
                            WHERE u.id_escuela = ?;`

    const valor : unknown[] = [ id.id_escuela ];
    
    return listarEntidadSinPaginacion({
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
 * Consulta y obtiene el detalle completo de los movimientos de una caja específica (excluyendo el saldo inicial) 
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
                        WHERE dc.id_caja = ?
                        AND cc.nombre_categoria != 'Saldo Inicial';`

    const valor : unknown[] = [ data.id_caja ];
    
    return listarEntidadSinPaginacion({
        slqListado : sql,
        valores : valor,
        entidad : "DETALLE_CAJA_RESUMEN",
        estado : ""
    });

} 

export const method = {
    listaEstadoCaja : tryCatchDatos(listaEstadoCaja),
    detalleCajasCerradas : tryCatchDatos(detalleCajasCerradas),
    metricasMetodoPagoCajas : tryCatchDatos( metricasMetodoPagoCajas),
    usuarioEscuela : tryCatchDatos( usuarioEscuela),
    libroDiarioDetalle : tryCatchDatos( libroDiarioDetalle ),
};


