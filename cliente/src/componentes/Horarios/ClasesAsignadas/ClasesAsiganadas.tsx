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
}

/**
 * Contenido visual de una celda **con clase asignada**.
 *
 * Ya NO es interactivo: el `onClick` y el `tabIndex` viven en el `<td>` de
 * `Calendario`, que es el único elemento accionable de la celda (spec 014).
 *
 * @param dia - Día de la celda.
 * @param hora - Franja horaria de la celda.
 * @param Horarios_Clases - Todas las clases, para ubicar la de esta celda.
 */
export const ClaseAsignada: React.FC<ClaseAsignadaProps> = ({
  dia,
  hora,
  Horarios_Clases,
}) => {
  const clase = Horarios_Clases?.find(
    (horario) => horario.dia === dia && horario.hora_inicio === hora,
  );

  if (!clase) return null;

  return (
    <div className="tarjeta_clase_asignada" title="Ver o modificar la clase">
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
