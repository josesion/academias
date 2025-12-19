import type React from "react";

import {type Horas , type DiaSemana ,} from "../../tipadosTs/horario";

export interface ClaseHorario {
  dia: DiaSemana;
  hora_inicio: Horas;
  tipo_clase: string;
  profesor: string;
  nivel: string;
  hora_fin: string;
  estado: string;
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
  onSelect
}) => {

  const clase = Horarios_Clases?.find(
    horario => horario.dia === dia && horario.hora_inicio === hora
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

