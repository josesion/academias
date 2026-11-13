import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataLog, FilaLogEventos } from "../data/log.data";
import { TipadoData } from "../tipados/tipado.data";

import { EsquemaListadoLogEventos, EsquemaMarcarLogEventos,
         ListadoLogEventosInput, InputMarcarLogEventos,
         ListadoLogEventosParametros } from "../squemas/log";

/**
 * Listado paginado de los eventos registrados en `logs_eventos`.
 *
 * 1. Valida la query con `EsquemaListadoLogEventos` (Zod vive solo en esta capa):
 *    si un filtro no es válido lanza `ZodError` y **la SQL nunca se ejecuta** (400).
 * 2. Calcula el `offset` a partir de `pagina` y `limit`.
 * 3. Consulta la data y traduce sus códigos a los de `MAPA_LISTAR_LOG_EVENTOS`.
 *
 * @param data - Query de la request (paginación y filtros opcionales).
 * @returns {Promise<TipadoData<FilaLogEventos[]>>} Listado o `SIN_LOG_EVENTOS` (204:
 *   "no hay eventos para ese filtro", que viaja **sin cuerpo**).
 */
const listar = async (data: ListadoLogEventosInput): Promise<TipadoData<FilaLogEventos[]>> => {

    const base = EsquemaListadoLogEventos.parse(data);

    const parametros: ListadoLogEventosParametros = { ...base, offset: ( base.pagina - 1 ) * base.limit };

    const resultado = await dataLog.listar(parametros);

    if ( resultado.code === "LOG_EVENTOS_LISTED" ){
        return {
            error : false,
            message : "Listado de eventos.",
            data : resultado.data,
            paginacion : resultado.paginacion,
            code : "LOG_EVENTOS_OK"
        };
    };

    if ( resultado.code === "NO_ACTIVE_LOG_EVENTOS" ){
        return {
            error : true,
            message : resultado.message,
            code : "SIN_LOG_EVENTOS"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , listar eventos.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Marca (o desmarca) un evento como revisado.
 *
 * 1. Valida el body con `EsquemaMarcarLogEventos` (Zod vive solo en esta capa).
 * 2. Comprueba que el `id_log` exista: si no, corta con `LOG_NO_ENCONTRADO` (404).
 * 3. Delega en la data, que solo cambia la bandera `resuelto`.
 *
 * @param data - `req.body` del PUT (`id_log`, `resuelto`).
 * @returns {Promise<TipadoData<InputMarcarLogEventos>>} `LOG_MARCADO_OK` (200),
 *   `LOG_NO_ENCONTRADO` (404) o `ERROR_SERVIDOR`.
 */
const marcar = async (data: unknown): Promise<TipadoData<InputMarcarLogEventos>> => {

    const parametros = EsquemaMarcarLogEventos.parse(data);

    // 1. ¿Existe ese evento?
    const existe = await dataLog.buscarPorId(parametros.id_log);

    if ( existe.code === "LOG_EVENTOS_NO_EXISTE" ){
        return {
            error : true,
            message : "No existe un evento con ese id.",
            code : "LOG_NO_ENCONTRADO"
        };
    };

    // 2. Cambio de la bandera (la fila no se edita ni se borra)
    const resultado = await dataLog.marcar(parametros);

    if ( resultado.code === "LOG_EVENTOS_MODIFICAR" ){
        return {
            error : false,
            message : parametros.resuelto === 1 ? "Evento marcado como revisado." : "Evento marcado como pendiente.",
            data : parametros,
            code : "LOG_MARCADO_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , marcar evento.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
    listar: tryCatchDatos(listar),
    marcar: tryCatchDatos(marcar)
};
