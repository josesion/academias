import TransportStream from 'winston-transport';
import { iud } from './baseDatos';

/**
 * Claves del objeto meta de winston que se guardan dentro de la columna `detalle` (JSON).
 * Es una **lista blanca**: lo que no está acá no se persiste, así un `logger.error(msg, {…})`
 * con datos de más (body, headers, cookies) jamás llega a la tabla.
 */
const CLAVES_DETALLE = ['stack', 'motivo', 'mensaje', 'destino', 'asunto', 'codigo'];

/** Registros máximos de log esperando conexión en un momento dado. */
const MAX_PENDIENTES = 50;

/** Cuántas escrituras hay en vuelo ahora mismo (se sube al INSERT y baja al terminar). */
let pendientes = 0;

const SQL_INSERT = `INSERT INTO logs_eventos
                        (nivel, origen, mensaje, detalle,
                         metodo_http, ruta, estado_http, duracion_ms,
                         id_escuela, id_usuario)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

/**
 * Recorta un texto al largo máximo que admite la columna.
 *
 * @function recortar
 * @param {unknown} valor - Valor recibido (se fuerza a texto).
 * @param {number} max - Cantidad máxima de caracteres.
 * @returns {string} Texto recortado, o cadena vacía si no era texto.
 */
const recortar = (valor: unknown, max: number): string => {
    const texto = typeof valor === 'string' ? valor : '';
    return texto.length > max ? texto.slice(0, max) : texto;
};

/**
 * Convierte un valor recibido en número entero o `null`.
 *
 * @function aEntero
 * @param {unknown} valor - Valor a convertir (número o string de la query).
 * @returns {number | null} El número, o `null` si no era convertible.
 */
const aEntero = (valor: unknown): number | null => {
    if (valor === undefined || valor === null || valor === '') return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? Math.trunc(numero) : null;
};

/**
 * Arma la fila que se va a insertar en `logs_eventos` a partir de la info de winston.
 *
 * - `mensaje` y `ruta` se recortan a los largos de sus columnas.
 * - Del meta solo se toman los campos esperados (`origen`, `metodo_http`, `ruta`,
 *   `estado_http`, `duracion_ms`, `id_escuela`, `id_usuario`) más la lista blanca
 *   de `detalle`. Nunca se persisten cookies, headers ni body.
 *
 * @function armarFila
 * @param {Record<string, unknown>} info - Objeto que winston arma con `level`, `message` y el meta.
 * @returns {{ valores: unknown[] }} Los 10 valores en el orden del `INSERT`.
 */
const armarFila = (info: Record<string, unknown>): { valores: unknown[] } => {

    const detalle: Record<string, unknown> = {};
    for (const clave of CLAVES_DETALLE) {
        if (info[clave] !== undefined && info[clave] !== null) detalle[clave] = info[clave];
    }

    const nivel = typeof info.level === 'string' ? info.level : 'info';
    const origen = typeof info.origen === 'string' ? info.origen : 'servidor';
    const mensaje = typeof info.message === 'string' ? info.message : String(info.message ?? '');

    return {
        valores: [
            recortar(nivel, 10),
            recortar(origen, 20),
            recortar(mensaje, 4000),
            Object.keys(detalle).length > 0 ? JSON.stringify(detalle) : null,
            recortar(info.metodo_http, 10),
            recortar(info.ruta, 255),
            aEntero(info.estado_http),
            aEntero(info.duracion_ms),
            aEntero(info.id_escuela),
            aEntero(info.id_usuario)
        ]
    };
};

/**
 * Transporte de winston que vuelca cada registro a la tabla `logs_eventos`.
 *
 * Tres reglas que no se rompen:
 * 1. Se responde a winston **antes** de tocar la base de datos: el log nunca
 *    demora ni bloquea la petición que lo originó.
 * 2. Si hay demasiadas escrituras en vuelo, el registro se descarta: el log
 *    no debe saturar el pool de conexiones cuando algo se dispara.
 * 3. Si el INSERT falla se usa `console.error` y **nunca** `logger`, porque
 *    se entraría en un bucle infinito de errores de log.
 */
class TransporteEventos extends TransportStream {

    constructor() {
        super({ level: 'info' });
    }

    /**
     * Recibe cada mensaje que pasa el logger y lo guarda en la tabla.
     *
     * @function log
     * @param {Record<string, unknown>} info - Registro de winston.
     * @param {() => void} callback - Se invoca de inmediato para liberar a winston.
     * @returns {void}
     */
    log(info: Record<string, unknown>, callback: () => void): void {

        callback();

        if (pendientes >= MAX_PENDIENTES) return;

        let valores: unknown[];
        try {
            ({ valores } = armarFila(info));
        } catch {
            return;
        }

        pendientes++;

        void iud(SQL_INSERT, valores).then(
            () => { pendientes--; },
            (error: unknown) => {
                pendientes--;
                const motivo = error instanceof Error ? error.message : String(error);
                console.error(`[logs_eventos] No se pudo guardar el registro: ${motivo}`);
            }
        );
    }
}

export default TransporteEventos;
