import type React from "react";
import { User, DoorOpen } from "lucide-react";
import { type Horas, type DiaSemana } from "../../../tipadosTs/horario_gym";
import "./claseasignadagym.css";

interface ClaseAsignadaGymProps {
  sala_nombre: string;
  profesor_apellido?: string;
  profesor_nombre?: string;
  tipo_clase?: string;
  estado?: string;
}

/**
 * Contenido visual de una celda **con clase asignada** en el calendario del Gym.
 * Muestra sala (obligatorio), profesor y tipo (opcionales).
 */
export const ClaseAsignadaGym: React.FC<ClaseAsignadaGymProps> = ({
  sala_nombre,
  profesor_apellido,
  profesor_nombre,
  tipo_clase,
  estado,
}) => {
  return (
    <div className={`tarjeta_clase_asignada estado_${estado || "activos"}`} title="Ver o modificar la clase">
      <div className="clase_indicador_lateral" />

      <div className="clase_contenido_interno">
        {/* Sala siempre visible */}
        <div className="clase_sala_badge">
          <DoorOpen size={12} />
          <span className="clase_sala_texto">{sala_nombre}</span>
        </div>

        {/* Profesor si existe */}
        {profesor_apellido && (
          <div className="clase_detalle_profe">
            <User size={12} />
            <span className="clase_profesor_texto">
              {profesor_apellido} {profesor_nombre}
            </span>
          </div>
        )}

        {/* Tipo si existe */}
        {tipo_clase && (
          <span className="clase_tipo_badge">{tipo_clase}</span>
        )}
      </div>
    </div>
  );
};
