import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import type { Caracteristica } from "./administrador.fetch";

/**
 * Fila de `planes_saas` tal como la ve la landing pública.
 *
 * `caracteristicas` se declara con las 3 formas en las que puede llegar desde
 * el server: como array (lo que produce el Zod del alta), como string JSON
 * (según cómo se haya guardado) o como `null` (columna `JSON NULL`).
 */
export interface PlanPublicoRow {
  id_plan: number;
  tipo: "basico" | "intermedio" | "premium";
  descripcion: string;
  /** `DECIMAL(10,2)`: llega como string (`"60000.00"`), ver `Number()` en el hook. */
  precio: number;
  cant_flyers: number;
  caracteristicas: Caracteristica[] | string | null;
  estado: "activo" | "inactivo";
}

/**
 * Trae los planes SaaS **activos** para la pantalla pública de planes.
 *
 * El endpoint (`GET /api/lista_planes_saas/:estado`) no lleva `validarPermiso`:
 * es catálogo comercial, no dato de tenant. El `estado` va **fijo en
 * `"activo"`** — no es un parámetro porque la landing nunca muestra dados de
 * baja. Ojo: mandarlo vacío daría `/api/lista_planes_saas/` y Express
 * respondería 404 (el `default('activo')` del Zod es para `undefined`, no para
 * `""`).
 *
 * @param signal - Señal de cancelación (el hook la crea con un `AbortController`).
 * @returns Respuesta tipada con el listado de planes activos.
 */
export const getPlanesPublicos = async (
  signal?: AbortSignal
): Promise<ApiResponse<PlanPublicoRow[]>> => {
  return await apiFetch<PlanPublicoRow[]>(`${PAGINA}api/lista_planes_saas/activo`, {
    method: "GET",
    signal,
  });
};