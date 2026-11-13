import { useCallback, useEffect, useState } from "react";

import {
  getPlanesPublicos,
  type PlanPublicoRow,
} from "../../servicio/planes.public.fetch";
import type { Caracteristica } from "../../servicio/administrador.fetch";

/** Fila de plan ya normalizada: `precio` numérico y características tipadas. */
export interface PlanPublico {
  id_plan: number;
  tipo: string;
  descripcion: string;
  precio: number;
  caracteristicas: Caracteristica[];
}

export interface PlanesPublicos {
  planes: PlanPublico[];
  carga: boolean;
  error: string | null;
  recargar: () => void;
}

/** Corta el request si el server no responde a tiempo (mismo criterio que `useEfectServicio`). */
const TIMEOUT_MS = 8000;

/**
 * `caracteristicas` es una columna `JSON` y llega en cualquiera de 3 formas:
 * como array (lo que produce el Zod del alta), como string JSON (según cómo se
 * haya guardado) o como `null` (columna `JSON NULL`). Cualquier otro valor —
 * o un JSON inválido — se degrada a lista vacía para que la card no se rompa.
 */
const normalizarCaracteristicas = (
  crudo: PlanPublicoRow["caracteristicas"]
): Caracteristica[] => {
  if (Array.isArray(crudo)) return crudo;

  if (typeof crudo === "string") {
    try {
      const parseado = JSON.parse(crudo);
      return Array.isArray(parseado) ? parseado : [];
    } catch {
      return [];
    }
  }

  return [];
};

/**
 * Carga los planes públicos de la landing (`/` → pantalla "Planes").
 *
 * Es un único GET de lectura contra un catálogo público, así que va directo con
 * `useState` + `useEffect`: no hay reducer que justifique `useEfectServicio`
 * (que exige un `dispatch`).
 *
 * Devuelve las filas **ya normalizadas** para que la página solo haga `.map()`:
 * `precio` viene como string (`DECIMAL(10,2)` sin `decimalNumbers` en el pool)
 * y `caracteristicas` puede ser array, string JSON o `null`.
 *
 * @returns Listado de planes activos, estado de carga, mensaje de error y un
 *          `recargar` para reintentar a mano.
 */
export const usePlanesPublicos = (): PlanesPublicos => {
  const [planes, setPlanes] = useState<PlanPublico[]>([]);
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disparo, setDisparo] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // El cleanup lo pone en false: mientras siga en true somos el efecto vivo
    // (el abort pendiente es del timeout, no de un desmontaje).
    let vigente = true;

    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const pedir = async () => {
      setCarga(true);
      setError(null);

      const result = await getPlanesPublicos(controller.signal);

      // Desmontados (o `StrictMode` remontó el efecto): no pintamos estados.
      if (!vigente) return;

      setCarga(false);

      // Una cancelación solo puede venir del timeout (el desmontaje ya se
      // filtró arriba con `vigente`).
      if (result.code === "REQUEST_ABORTED") {
        setPlanes([]);
        setError("El servidor tardó demasiado en responder.");
        return;
      }

      if (result.error) {
        setPlanes([]);
        setError(result.message || "No se pudieron cargar los planes.");
        return;
      }

      setPlanes(
        (result.data ?? []).map((plan) => ({
          id_plan: plan.id_plan,
          tipo: plan.tipo,
          descripcion: plan.descripcion,
          precio: Number(plan.precio),
          caracteristicas: normalizarCaracteristicas(plan.caracteristicas),
        }))
      );
    };

    pedir();

    return () => {
      vigente = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [disparo]);

  const recargar = useCallback(() => setDisparo((n) => n + 1), []);

  return { planes, carga, error, recargar };
};