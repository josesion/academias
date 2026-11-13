import { ORDEN_PLANES } from "./menu.types";
import type { ReglasPlan, SeccionMenu, TipoPlan } from "./menu.types";

export const puedeVer = (elemento: ReglasPlan, tipo?: TipoPlan | null): boolean => {
  if (elemento.planes) {
    return tipo ? elemento.planes.includes(tipo) : false;
  }
  if (!elemento.planMinimo) return true;
  if (!tipo) return false;

  return ORDEN_PLANES[tipo] >= ORDEN_PLANES[elemento.planMinimo];
};

export const filtrarSecciones = (
  secciones: SeccionMenu[],
  tipo?: TipoPlan | null
): SeccionMenu[] =>
  secciones
    .filter((seccion) => puedeVer(seccion, tipo))
    .map((seccion) => ({
      ...seccion,
      items: seccion.items.filter((item) => puedeVer(item, tipo)),
    }))
    // si una sección se queda sin ítems visibles, no la mostramos vacía
    .filter((seccion) => seccion.items.length > 0);