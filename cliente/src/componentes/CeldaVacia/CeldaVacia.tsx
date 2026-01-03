import type { DiaSemana, Horas } from "../../tipadosTs/horario";

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
 * - Al hacer click, notifica al componente padre con la información
 *   contextual (día, hora y mensaje).
 *
 * @param mensaje Texto a mostrar dentro de la celda.
 * @param dia Día de la semana de la celda.
 * @param hora Hora asociada a la celda.
 * @param onSelect Callback ejecutado al seleccionar la celda.
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
  onSelect?: (data: MensajeCelda) => void;
}

export const CeldaVacia: React.FC<CeldaVaciaProps> = ({
  mensaje = "Sin clase",
  dia,
  hora,
  onSelect,
}) => {
  // Emite el contexto de la celda para acciones de alta
  const handleClick = () => {
    onSelect?.({ mensaje, dia, hora });
  };

  return (
    <div className="celda_vacia" onClick={handleClick}>
      {mensaje || "Sin clase"}
    </div>
  );
};
