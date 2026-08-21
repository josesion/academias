import type React from "react";
import { User } from "lucide-react";
import { type Horas, type DiaSemana } from "../../../tipadosTs/horario";
import "./claseasignar.css";

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
  const clase = Horarios_Clases?.find(
    (horario) => horario.dia === dia && horario.hora_inicio === hora,
  );

  if (!clase) return null;

  const handleClick = () => {
    onSelect?.(clase);
  };

  return (
    <div
      className="tarjeta_clase_asignada"
      onClick={handleClick}
      title="Click para ver o modificar"
    >
      <div className="clase_indicador_lateral" />

      <div className="clase_contenido_interno">
        {/* Bloque principal en columna: Tipo de clase y Nivel */}
        <div className="clase_header_columna">
          <span className="clase_tipo_badge">{clase.tipo_clase}</span>
          <span className="clase_nivel_badge">{clase.nivel}</span>
        </div>

        {/* Bloque del profesor abajo */}
        <div className="clase_detalle_profe">
          <User size={12} />
          <span className="clase_profesor_texto">{clase.profesor}</span>
        </div>
      </div>
    </div>
  );
};
