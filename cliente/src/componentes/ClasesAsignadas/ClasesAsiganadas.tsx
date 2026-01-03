import type React from "react";

import { type Horas, type DiaSemana } from "../../tipadosTs/horario";

/**
 * Componente ClaseAsignada.
 *
 * Representa visualmente una clase ya asignada dentro del calendario
 * para un día y una hora específica.
 *
 * Funcionalidades:
 * - Busca la clase correspondiente al par (día + hora).
 * - Renderiza la información básica de la clase.
 * - Permite seleccionar la clase para acciones posteriores
 *   (ej: modificar o eliminar).
 *
 * Lógica clave:
 * - Si no existe una clase para la combinación `dia` + `hora`,
 *   el componente no renderiza nada.
 *
 * Suposiciones:
 * - No existen clases duplicadas para el mismo día y hora.
 * - `Horarios_Clases` contiene todas las clases del calendario.
 *
 * @param dia Día de la semana a evaluar.
 * @param hora Hora de inicio de la clase.
 * @param Horarios_Clases Listado completo de clases asignadas.
 * @param onSelect Callback ejecutado al hacer click sobre la clase.
 */

export interface ClaseHorario {
  dia: DiaSemana;
  hora_inicio: Horas;
  id_clase: number;
  tipo_clase: string;
  profesor: string;
  nombre: string;
  Dni: string;
  dni_profe: string;
  nivel: string;
  id_nivel: number;
  hora_fin: string;
  estado: string;
  id_horario: number;
}

interface ClaseAsignadaProps {
  dia: DiaSemana;
  hora: Horas;
  Horarios_Clases?: ClaseHorario[];
  onSelect?: (clase: ClaseHorario) => void;
}

export const ClaseAsignada: React.FC<ClaseAsignadaProps> = ({
  dia,
  hora,
  Horarios_Clases,
  onSelect,
}) => {
  // Busca la clase correspondiente al día y hora actual
  const clase = Horarios_Clases?.find(
    (horario) => horario.dia === dia && horario.hora_inicio === hora
  );

  if (!clase) return null;

  const handleClick = () => {
    onSelect?.(clase);
  };

  return (
    <div className="clase_asignada" onClick={handleClick}>
      <p className="clase_tipo">{clase.tipo_clase}</p>
      <p className="clase_profesor">Prof: {clase.profesor}</p>
    </div>
  );
};
