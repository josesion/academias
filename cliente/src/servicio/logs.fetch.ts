import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


/**
 * Filtros del listado de eventos (van por query string).
 *
 * `pagina` y `limit` son los únicos obligatorios (el server los pone en 1 y 10
 * por defecto, y `limit` no puede pasar de 100). **Todos los demás son
 * opcionales y se omiten si llegan vacíos**: en `logs_eventos` no existe el
 * `default()` que sí hay en otros listados, así que "sin filtro" y "no Filter"
 * son exactamente lo mismo (Zod los deja fuera del `WHERE`).
 */
export interface FiltrosQuery {
    pagina: number;
    limit: number;
    /** `error` | `warn` | `info` */
    nivel?: string;
    /** `peticion` | `correo` | `cron` | `arranque` | `servidor` */
    origen?: string;
    /** Se busca con `LIKE %…%`: no es una ruta exacta */
    ruta?: string;
    /** 0 = pendiente, 1 = revisado */
    resuelto?: number;
    /** `AAAA-MM-DD` (el server exige ese formato exacto) */
    fecha_desde?: string;
}

/**
 * Una fila de `logs_eventos`, tal como la devuelve el listado.
 * `detalle` llega como objeto (el server guarda el JSON serializado) y puede
 * ser `null` en los eventos que no llevan contexto.
 */
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
 * Listado paginado de eventos del sistema (GET /api/logs_eventos).
 *
 * Solo responde el rol **administrador** (`permisos.soloAdministrador` en el
 * server), que es quien tiene esta pantalla.
 *
 * Respuestas del server:
 * - `LOG_EVENTOS_OK` (200): `data` con las filas + `paginacion`
 *   (`{ pagina, limite, contadorPagina }`).
 * - `SIN_LOG_EVENTOS` (**204**): no hay filas para ese filtro. El server manda
 *   el 204 sin cuerpo, así que `apiFetch` lo normaliza a
 *   `{ error: false, data: null }` — es decir, **lista vacía, no error**.
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - Paginación y filtros opcionales del listado.
 * @returns Respuesta estandarizada (`error`, `message`, `code`, `data`,
 *   `paginacion`).
 */
export const listaLogs = async( data : FiltrosQuery )
 : Promise<ApiResponse<FilaLogEventos[]>> =>{

const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }
     
    const params = new URLSearchParams();

    if (data.pagina) params.append("pagina", String(data.pagina));
    if (data.limit) params.append("limit", String(data.limit));
    if (data.nivel) params.append("nivel", data.nivel);
    if (data.origen) params.append("origen", data.origen);
    if (data.ruta) params.append("ruta", data.ruta);
    if (data.resuelto !== undefined) params.append("resuelto", String(data.resuelto));
    if (data.fecha_desde) params.append("fecha_desde", data.fecha_desde);

    const ruta = `${PAGINA}api/logs_eventos?${params.toString()}`;
    
    return await apiFetch<FilaLogEventos[]>(ruta, {
        method: "GET"
    }); 
};

/** Lo que el front manda al marcar (o desmarcar) un evento como revisado.
 *  `resuelto` es una bandera: 0 = pendiente, 1 = revisado. El registro en sí
 *  **jamás se edita ni se borra** (el server solo hace un UPDATE de la columna). */
export interface MarcarLogEventosInput {
    id_log: number;
    resuelto: number;
}

/**
 * Marca (o desmarca) un evento como revisado (PUT /api/logs_eventos_marcar).
 *
 * La ruta es distinta de la del listado: el server expone `listar` en
 * `/api/logs_eventos` y `marcar` en `/api/logs_eventos_marcar`.
 *
 * Respuestas del server:
 * - `LOG_MARCADO_OK` (200).
 * - `LOG_NO_ENCONTRADO` (404): ese `id_log` ya no existe.
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - `id_log` de la fila y el valor de `resuelto` contrario al actual.
 * @returns Respuesta estandarizada (`error`, `message`, `code`).
 */
export const putLogs = async( data : MarcarLogEventosInput )
 : Promise<ApiResponse<MarcarLogEventosInput>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }
     
     const ruta  = `${PAGINA}api/logs_eventos_marcar`; 
     return await apiFetch( ruta ,{
        method : "PUT",
        body : data

     });   
};