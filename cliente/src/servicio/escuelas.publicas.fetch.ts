import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import type { EscuelaPublicaRow } from "../tipadosTs/escuela.publica.typado";

/**
 * Trae las escuelas públicas activas para el tarjetero del Login (spec 054).
 *
 * El endpoint (`GET /api/escuelas_publicas`) **no lleva `validarPermiso`**: es
 * un catálogo comercial sin datos de tenant y el Login no tiene sesión. No
 * recibe query ni body, y el orden es estable (`razon_social ASC`): la mezcla
 * aleatoria es del cliente, en `useEscuelasPublicas`.
 *
 * Códigos posibles del server:
 * - `LISTADO_ESCUELAS_PUBLICAS_OK` (200): `data` con las escuelas.
 * - `LISTADO_ESCUELAS_PUBLICAS_VACIO` (200): `data: []`, sin error.
 * - `ERROR_SERVIDOR` (500) o fallo de red: `error: true` con `message`.
 *
 * No se pasa `credentials` explícito: se hereda el `include` de `apiFetch`
 * (la ruta no usa la cookie, pero el contrato del helper es el mismo para
 * todos los servicios).
 *
 * @param signal - Señal de cancelación (el hook la crea con un `AbortController`).
 * @returns Respuesta tipada con las filas crudas del listado público.
 */
export const getEscuelasPublicas = async (
  signal?: AbortSignal
): Promise<ApiResponse<EscuelaPublicaRow[]>> => {
  return await apiFetch<EscuelaPublicaRow[]>(`${PAGINA}api/escuelas_publicas`, {
    method: "GET",
    signal,
  });
};
