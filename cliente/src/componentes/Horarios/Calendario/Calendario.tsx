import React from "react";
import "./calendario.css";
import { ClaseAsignada } from "../ClasesAsignadas/ClasesAsiganadas";
import { CeldaVacia } from "../CeldaVacia/CeldaVacia";
import { Boton } from "../../generales/Boton/Boton";

import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import {
  type Horas,
  type DiaSemana,
  type ClaseHorarioData,
} from "../../../tipadosTs/horario";

interface CalendarioProps {
  handleModData: (clase: ClaseHorario) => void;
  handleAbrirModal: (mensaje: MensajeCelda) => void;
  handleVolver: () => void;
  horarios: Horas[];
  diasSemana: DiaSemana[];
  calendario?: ClaseHorarioData[];
}

export const Calendario: React.FC<CalendarioProps> = (data) => {
  const { horarios, diasSemana, calendario } = data;

  const calendarioMap = new Map<string, ClaseHorarioData>();

  calendario?.forEach((clase) => {
    calendarioMap.set(`${clase.dia}-${clase.hora_inicio}`, clase);
  });

  return (
    <div className="contenedor_calendario_completo">
      <div className="contenedor_calendario">
        <table className="tabla_calendario">
          <thead className="cabecera_calendario">
            <tr>
              {/* Esquina superior izquierda fija (sticky en ambas direcciones) */}
              <th className="th_hora_label esquina_fija">Hora</th>
              {diasSemana.map((dia) => (
                <th key={dia} className="th_dia_sticky">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="cuerpo_calendario">
            {horarios.map((hora) => (
              <tr key={hora}>
                {/* Columna de hora lateral fija al hacer scroll horizontal */}
                <td className="celda_hora_lateral">{hora}</td>

                {diasSemana.map((dia) => {
                  const clase = calendarioMap.get(`${dia}-${hora}`);

                  return (
                    <td key={dia} className="celda_interactiva">
                      {clase ? (
                        <div className="wrapper_clase_postit">
                          <ClaseAsignada
                            dia={dia}
                            hora={hora}
                            Horarios_Clases={calendario}
                            onSelect={data.handleModData}
                          />
                        </div>
                      ) : (
                        <div className="wrapper_celda_vacia">
                          <CeldaVacia
                            dia={dia}
                            hora={hora}
                            mensaje="+"
                            onSelect={data.handleAbrirModal}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="seccion_footer_calendario">
        <Boton
          clase="aceptar"
          logo="Back"
          texto="Volver"
          onClick={data.handleVolver}
        />
      </div>
    </div>
  );
};
