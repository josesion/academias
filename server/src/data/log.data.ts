import pool from "../bd";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidad } from "../hooks/funcionListar";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { TipadoData } from "../tipados/tipado.data";
import { ListadoLogEventosParametros, InputMarcarLogEventos } from "../squemas/log";

export interface FilaLogEventos {
    id_log: number;
    nivel: string;
    origen: string;
    mensaje: string;
    detalle: Record<string, unknown> | null;
    metodo_http: string | null;
    ruta: string | null;
    estado_http: number | null;
    duracion_ms: number | null;
    id_escuela: number | null;
    id_usuario: number | null;
    usuario_nom: string | null;
    resuelto: number;
    fecha: string | Date;
}

/**
 * Listado paginado de `logs_eventos`, del hecho más reciente al más viejo.
 *
 * - `usuario_nom` sale de `COALESCE(e.usuario_nom, u.usuario)`: la columna guarda el
 *   nombre en el momento del hecho (hoy siempre vacía porque el JWT no lo trae) y el
 *   `LEFT JOIN` a `usuarios` aporta el login mientras no haya snapshot.
 * - Cada filtro se agrega solo si llegó: sin parámetros la SQL no tiene `WHERE`.
 * - Usa el hook genérico `listarEntidad`, por lo que la SQL trae
 *   `COUNT(*) OVER() AS total_registros` para el cálculo de paginación.
 *
 * @param parametros - Lo validado por Zod en el Servicio más el `offset` calculado allí.
 * @returns {Promise<TipadoData<FilaLogEventos[]>>} Listado paginado o el error asociado.
 */
const listar = async (
    parametros: ListadoLogEventosParametros
): Promise<TipadoData<FilaLogEventos[]>> => {

    const { pagina, limit, offset, nivel, origen, ruta, resuelto, fecha_desde } = parametros;

    const condiciones: string[] = [];
    const valores: unknown[] = [];

    if (nivel !== undefined)    { condiciones.push("e.nivel = ?");     valores.push(nivel); }
    if (origen !== undefined)   { condiciones.push("e.origen = ?");    valores.push(origen); }
    if (ruta !== undefined)     { condiciones.push("e.ruta LIKE ?");   valores.push(`%${ruta}%`); }
    if (resuelto !== undefined) { condiciones.push("e.resuelto = ?");  valores.push(resuelto); }
    if (fecha_desde !== undefined) { condiciones.push("e.fecha >= ?"); valores.push(fecha_desde); }

    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

    const sql: string = `SELECT
                            e.id_log,
                            e.nivel,
                            e.origen,
                            e.mensaje,
                            e.detalle,
                            e.metodo_http,
                            e.ruta,
                            e.estado_http,
                            e.duracion_ms,
                            e.id_escuela,
                            e.id_usuario,
                            COALESCE(e.usuario_nom, u.usuario) AS usuario_nom,
                            e.resuelto,
                            e.fecha,
                            COUNT(*) OVER() AS total_registros
                        FROM logs_eventos e
                        LEFT JOIN usuarios u ON u.id_usuario = e.id_usuario
                        ${where}
                        ORDER BY e.id_log DESC
                        LIMIT ${limit} OFFSET ${offset};`;

    return listarEntidad<FilaLogEventos>({
        slqListado: sql,
        valores: valores,
        entidad: "Log_eventos",
        estado: "del sistema",
        limit: limit,
        pagina: String(pagina)
    });
};

/**
 * Localiza un evento por su identificador.
 *
 * Se consulta ANTES de marcarlo, para responder 404 si el id no existe
 * en lugar de dejar que el `UPDATE` afecte 0 filas.
 *
 * @param id_log - Identificador del registro a marcar.
 * @returns {Promise<TipadoData<{ id_log: number }>>} `LOG_EVENTOS_EXISTE` si hay fila /
 *   `LOG_EVENTOS_NO_EXISTE` si ese id no existe.
 */
const buscarPorId = async (
    id_log: number
): Promise<TipadoData<{ id_log: number }>> => {

    const sql: string = `SELECT id_log FROM logs_eventos WHERE id_log = ?;`;
    const valores: unknown[] = [id_log];

    return await buscarExistenteEntidad<{ id_log: number }>({
        slqEntidad: sql,
        valores,
        entidad: "Log_eventos"
    });
};

/**
 * Cambia la bandera `resuelto` de un evento (0 = pendiente, 1 = revisado).
 *
 * - El registro **nunca se edita ni se borra**: solo cambia esa bandera.
 * - `WHERE` únicamente por `id_log`.
 *
 * @param data - `id_log` y `resuelto` ya validados por Zod en el Servicio.
 * @returns {Promise<TipadoData<InputMarcarLogEventos>>} Estado aplicado o el error asociado.
 */
const marcar = async (
    data: InputMarcarLogEventos
): Promise<TipadoData<InputMarcarLogEventos>> => {

    const { id_log, resuelto } = data;

    const sql: string = `UPDATE logs_eventos
                         SET resuelto = ?
                         WHERE id_log = ?;`;

    const valores: unknown[] = [resuelto, id_log];

    return await iudEntidad({
        slqEntidad: sql,
        valores,
        entidad: "Log_eventos",
        metodo: "MODIFICAR",
        datosRetorno: data
    });
};

/**
 * Borra los eventos con más de 30 días de antigüedad.
 *
 * Es la purga del cron diario. Usa `pool.execute` directamente (igual que
 * `vencerInscripciones`) porque que no haya nada que borrar **no es un error**:
 * el hook `iudEntidad` lanzaría excepción con 0 filas afectadas.
 *
 * @async
 * @function limpiarEventosViejos
 * @returns {Promise<void>}
 */
const limpiarEventosViejos = async (): Promise<void> => {
    const sql = `DELETE FROM logs_eventos
                 WHERE fecha < DATE_SUB(NOW(), INTERVAL 30 DAY);`;

    await pool.execute(sql);
};

export const method = {
    listar: tryCatchDatos(listar),
    buscarPorId: tryCatchDatos(buscarPorId),
    marcar: tryCatchDatos(marcar),
    limpiarEventosViejos: tryCatchDatos(limpiarEventosViejos)
};
