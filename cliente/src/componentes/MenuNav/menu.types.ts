import type { IconType } from "react-icons";

export type TipoPlan = "basico" | "intermedio" | "premium";

/** Jerarquía: un plan superior ve todo lo del inferior. */
export const ORDEN_PLANES: Record<TipoPlan, number> = {
  basico: 1,
  intermedio: 2,
  premium: 3,
};

/** Reglas de visibilidad compartidas por ítems y secciones. */
export interface ReglasPlan {
  /** Visible desde este plan hacia arriba. */
  planMinimo?: TipoPlan;
  /** Visible SOLO para estos planes (tiene prioridad sobre planMinimo). */
  planes?: TipoPlan[];
}

export interface ItemMenu extends ReglasPlan {
  etiqueta: string;
  /**
   * Etiqueta alternativa según el rubro de la escuela (spec 047).
   *
   * Si el rubro de la sesión tiene una entrada acá, reemplaza a `etiqueta`.
   * La ruta y el resto del ítem no cambian: solo el texto visible. Se usa para
   * "Géneros Musicales" → "Entrenamientos" cuando la escuela es `gym`.
   */
  etiquetaPorRubro?: Partial<Record<"baile" | "gym", string>>;
  icono: IconType;
  ruta: string;
  color?: string;
  tamano?: number;
}

export interface SeccionMenu extends ReglasPlan {
  clave: string;
  etiqueta: string;
  icono: IconType;
  items: ItemMenu[];
}