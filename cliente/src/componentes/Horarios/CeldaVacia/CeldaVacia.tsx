import type { DiaSemana, Horas } from "../../../tipadosTs/horario";
import "./celdavacia.css";
/**
 * Componente CeldaVacia.
 *
 * Representa una celda libre dentro del calendario (sin clase asignada)
 * para una combinación específica de día y hora.
 *
 * Funcionalidades:
 * - Muestra un mensaje indicando disponibilidad u otro estado.
 * - Permite seleccionar la celda para iniciar una acción
 *   (ej: crear una nueva clase en ese horario).
 *
 * Comportamiento:
 * - Si no se provee un mensaje, se muestra "Sin clase" por defecto.
 * - La celda NO tiene click propio: el `<td>` de `Calendario` maneja el click
 *   y el teclado (spec 014).
 *
 * @param mensaje Texto a mostrar dentro de la celda.
 * @param dia Día de la semana de la celda.
 * @param hora Hora asociada a la celda.
 */

export interface MensajeCelda {
  mensaje: string;
  dia: DiaSemana;
  hora: Horas;
}

interface CeldaVaciaProps {
  mensaje?: string;
  dia: DiaSemana;
  hora: Horas;
}

/**
 * Contenido visual de una celda **libre** del calendario.
 *
 * Ya NO es interactivo: el `onClick` y el `tabIndex` viven en el `<td>` de
 * `Calendario`, que es el único elemento accionable de la celda (spec 014).
 * Antes esta celda era un `<div onClick>` sin foco, dentro de una grilla de 112
 * celdas: ni se podía tabular ni activar con el teclado.
 *
 * @param mensaje - Texto a mostrar dentro de la celda ("+", "Sin clase"…).
 * @param dia - Día de la semana de la celda.
 * @param hora - Hora asociada a la celda.
 */
export const CeldaVacia: React.FC<CeldaVaciaProps> = ({
  mensaje = "Sin clase",
}) => {
  return <div className="celda_vacia">{mensaje || "Sin clase"}</div>;
};
