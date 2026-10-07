import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import pool from "../bd";

import { SuscripcionInputs, FiltrosSuscripciones } from "../squemas/suscripciones.escuela";
import { TipadoData } from "../tipados/tipado.data";


export interface SuscripcionDatos {
    id_escuela: number;
    id_plan_saas: number;
    fecha_inscripcion: string;   // "YYYY-MM-DD"
    fecha_vencimiento: string;   // "YYYY-MM-DD"
}

const postSuscripcion = async ( data : SuscripcionInputs )
:Promise<TipadoData<SuscripcionDatos>> =>{

    const { id_escuela , id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado } = data ;

    const sql : string = `INSERT INTO suscripciones_escuelas (
                                id_escuela, 
                                id_plan_saas, 
                                fecha_inscripcion, 
                                fecha_vencimiento, 
                                estado
                            ) 
                            VALUES (?, ?, ?, ?, ?);`;

    const valores : unknown[] = [id_escuela, id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado];

    return await  iudEntidad({
        slqEntidad : sql,
        valores : valores,
        entidad : "SUSCRIPCION",
        metodo  : "CREAR",
        datosRetorno : { id_escuela, id_plan_saas, fecha_inscripcion, fecha_vencimiento}
    });
};

const verificarSuscripcion = async ( id_escuela : number ) 
:Promise<TipadoData<{id_suscripcion : number}>>  =>{ 

     const sql : string = `SELECT id_suscripcion 
                            FROM suscripciones_escuelas 
                            WHERE id_escuela = ?
                            AND estado = 'activo';`;

    const valores : unknown[] = [ id_escuela ];  
    
    return await  buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valores,
        entidad : "Suspcripcion" 
    });
};


const vencerPlanesEscuelas  = async ( ) => {
  const sql = `UPDATE suscripciones_escuelas 
                            SET estado = 'vencido' 
                            WHERE id_suscripcion > 0 
                            AND estado = 'activo' 
                            AND fecha_vencimiento < CURDATE()`;

  await pool.execute(sql);
};


export interface SuscripcionEscuelaDto {
    id_suscripcion: number;
    id_escuela: number;
    razon_social: string;
    id_plan_saas: number;
    tipo_plan: string;
    descripcion_plan: string;
    fecha_inscripcion: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    fecha_vencimiento: string; // Ya viene formateada como string 'DD/MM/YYYY' desde MySQL
    estado_suscripcion: string;
}

const getSuscripciones = async ( data : FiltrosSuscripciones, pagina : string )
:Promise<TipadoData<SuscripcionEscuelaDto[]>> =>{
    const { 
        razon_social, id_plan_saas, estado, fecha_inscripcion,
        limit, offset, 
    } = data ;

    const sql : string =`SELECT 
                            s.id_suscripcion,
                            e.id_escuela,
                            e.razon_social,
                            p.id_plan AS id_plan_saas,
                            p.tipo AS tipo_plan,
                            p.descripcion AS descripcion_plan,
                            DATE_FORMAT(s.fecha_inscripcion, '%d/%m/%Y') AS fecha_inscripcion,
                            DATE_FORMAT(s.fecha_vencimiento, '%d/%m/%Y') AS fecha_vencimiento,
                            s.estado AS estado_suscripcion,
                             COUNT(*) OVER() AS total_registros
                        FROM 
                            suscripciones_escuelas s
                        INNER JOIN 
                            escuelas e ON s.id_escuela = e.id_escuela
                        INNER JOIN 
                            planes_saas p ON s.id_plan_saas = p.id_plan
                        WHERE 
                            -- Filtro por razón social 
                            e.razon_social LIKE ?
                            
                            -- Filtro por ID del plan SaaS 
                            AND CAST(s.id_plan_saas AS CHAR) LIKE ?
                            
                            -- Filtro por fecha de inscripción exactas
                            AND s.fecha_inscripcion like ?
                            
                            -- Filtro por estado de la suscripción
                            AND s.estado like ?
                            LIMIT ${limit} OFFSET ${offset}; ;`; 

    const valores : unknown[] = [razon_social, id_plan_saas, fecha_inscripcion, estado];
    
    return listarEntidad({
        slqListado : sql,
        valores : valores,
        entidad : "LISTADO_SUSP",
        estado  : estado,
        limit : limit, 
        pagina : String(pagina)
    });
};

/** Fila del combo de escuelas (id + razón social) */
export interface EscuelaSelect {
    id_escuela: number;
    razon_social: string;
};

/**
 * Listado liviano de escuelas (solo id y razón social) para el combo
 * del formulario de suscripciones. Trae únicamente las escuelas dadas de baja lógica.
 *
 * @returns Promise<TipadoData<EscuelaSelect[]>> Listado de escuelas activas.
 */
const listarEscuelasSelect = async ( )
:Promise<TipadoData<EscuelaSelect[]>> =>{

    const sql : string = `SELECT id_escuela, razon_social
                            FROM escuelas
                            WHERE baja = 'activos'
                            ORDER BY razon_social ASC;`;

    const valores : unknown[] = [];

    return await listarEntidadSinPaginacion<EscuelaSelect>({
        slqListado : sql,
        valores : valores,
        entidad : "ESCUELA_SELECT",
        estado : "activas"
    });
};

/** Fila de retorno al modificar el estado de una suscripción */
export interface SuscripcionEstadoDto {
    id_suscripcion: number;
    estado: string;
};

/**
 * Cambia el estado de una suscripción (operación de anulación).
 * Si la consulta no afecta ninguna fila, `iudEntidad` lanza un ClientError 404.
 *
 * @param data - id de la suscripción y nuevo estado ("anulado").
 * @returns Promise<TipadoData<SuscripcionEstadoDto>> con la suscripción y su nuevo estado.
 */
const anularSuscripcion = async ( data : { id_suscripcion : number, estado : string } )
:Promise<TipadoData<SuscripcionEstadoDto>> =>{

    const sql : string = `UPDATE suscripciones_escuelas
                            SET estado = ?
                            WHERE id_suscripcion = ?;`;

    const valores : unknown[] = [ data.estado, data.id_suscripcion ];

    return await iudEntidad<SuscripcionEstadoDto>({
        slqEntidad : sql,
        valores : valores,
        entidad : "SUSCRIPCION",
        metodo : "MODIFICAR",
        datosRetorno : { id_suscripcion : data.id_suscripcion, estado : data.estado }
    });
};

/** Números del panel de métricas simples (admin, alcance global) */
export interface MetricasSimples {
    suscripciones_por_vencer: number;
    suscripciones_vencidas: number;
    total_mes: number;
    suscripciones_vigentes: number;
};

/**
 * Métricas simples del administrador, calculadas en una sola consulta sobre
 * `suscripciones_escuelas`:
 * - `suscripciones_por_vencer`: suscripciones activas que vencen en los próximos 7 días.
 * - `suscripciones_vencidas`: suscripciones con estado 'vencido' (las anuladas quedan fuera).
 * - `total_mes`: suma de los precios de los planes SaaS de las suscripciones inscritas
 *   en el mes en curso, excluyendo las anuladas.
 * - `suscripciones_vigentes`: suscripciones con estado 'activo'.
 *
 * @returns {Promise<TipadoData<MetricasSimples>>} Métricas del mes en curso.
 */
const metricasSimples = async ( )
:Promise<TipadoData<MetricasSimples>> =>{

    const sql : string = `SELECT
                            COALESCE(SUM(CASE
                                WHEN s.estado = 'activo'
                                 AND s.fecha_vencimiento BETWEEN CURDATE()
                                                             AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                                THEN 1 ELSE 0
                            END), 0) AS suscripciones_por_vencer,

                            COALESCE(SUM(CASE
                                WHEN s.estado = 'vencido' THEN 1 ELSE 0
                            END), 0) AS suscripciones_vencidas,

                            COALESCE(SUM(CASE
                                WHEN s.estado <> 'anulado'
                                 AND MONTH(s.fecha_inscripcion) = MONTH(CURDATE())
                                 AND YEAR(s.fecha_inscripcion)  = YEAR(CURDATE())
                                THEN p.precio ELSE 0
                            END), 0) AS total_mes,

                            COALESCE(SUM(CASE
                                WHEN s.estado = 'activo' THEN 1 ELSE 0
                            END), 0) AS suscripciones_vigentes
                        FROM suscripciones_escuelas s
                        INNER JOIN planes_saas p ON p.id_plan = s.id_plan_saas;`;

    const valor : unknown[] = [];

    return await buscarExistenteEntidad<MetricasSimples>({
        slqEntidad : sql,
        valores : valor,
        entidad : "Metricas_simples"
    });
};

export const method = {
    postSuscripcion : tryCatchDatos( postSuscripcion ),
    verificarSuscripcion : tryCatchDatos( verificarSuscripcion),
    vencerPlanesEscuelas : tryCatchDatos( vencerPlanesEscuelas ),
    getSuscripciones : tryCatchDatos( getSuscripciones ),
    listarEscuelasSelect : tryCatchDatos( listarEscuelasSelect ),
    anularSuscripcion : tryCatchDatos( anularSuscripcion ),
    metricasSimples : tryCatchDatos( metricasSimples )
};