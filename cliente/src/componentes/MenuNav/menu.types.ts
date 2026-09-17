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