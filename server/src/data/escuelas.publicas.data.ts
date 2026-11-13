import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { EscuelaPublicaRow } from "../tipados/escuela.publica.tipado";

/**
 * Lista las escuelas con suscripción activa para el tarjetero público del Login (spec 054).
 *
 * - Una sola consulta y columnas nombradas una por una: nunca `SELECT *`
 *   (el contrato son 6 columnas y ninguna sensible).
 * - `NULLIF(urlImagen, '')` replica el criterio de la spec 037 (Ampliación 4):
 *   un string vacío se devuelve como `null`.
 * - `INNER JOIN suscripciones_escuelas` filtra solo las escuelas con `estado = 'activo'`.
 *   Las escuelas suspendidas, vencidas o sin suscripción no aparecen en el listado.
 * - El orden es **estable** (`razon_social ASC`): la mezcla aleatoria es del
 *   cliente, así el mismo endpoint sirve para cualquier pantalla futura.
 *
 * Si no hay filas, `listarEntidadSinPaginacion` devuelve `error: true` con
 * `code: "NO_ACTIVE_ESCUELAS_PUBLICAS"`; el servicio lo traduce a un éxito
 * vacío (un catálogo sin escuelas no es un fallo).
 *
 * @returns Respuesta tipada con las escuelas públicas con suscripción activa.
 */
const listarEscuelasPublicas = async (): Promise<TipadoData<EscuelaPublicaRow[]>> => {
    const sql: string = `SELECT e.id_escuela,
                                e.razon_social,
                                e.direccion,
                                e.celular,
                                NULLIF(e.urlImagen, '') AS urlImagen,
                                e.rubro
                           FROM escuelas e
                           INNER JOIN suscripciones_escuelas se
                               ON e.id_escuela = se.id_escuela
                          WHERE e.baja = 'activos'
                            AND se.estado = 'activo'
                          ORDER BY e.razon_social ASC;`;

    return await listarEntidadSinPaginacion<EscuelaPublicaRow>({
        slqListado: sql,
        valores: [],
        entidad: "ESCUELAS_PUBLICAS",
        estado: ""
    });
};

/**
 * Colección de métodos de la data del listado público de escuelas.
 * Cada método queda envuelto en `tryCatchDatos` para traducir los errores de
 * MySQL (por ejemplo `ER_DUP_ENTRY`) al contrato `TipadoData`.
 */
export const method = {
    listarEscuelasPublicas: tryCatchDatos(listarEscuelasPublicas)
};
