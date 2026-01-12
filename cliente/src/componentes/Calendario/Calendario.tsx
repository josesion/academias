import "./Calendario.css";
import { ClaseAsignada } from "../ClasesAsignadas/ClasesAsiganadas";
import { CeldaVacia } from "../CeldaVacia/CeldaVacia";
import { Boton } from "../Boton/Boton";

//---- typados ----//
import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import {
  type Horas,
  type DiaSemana,
  type ClaseHorarioData,
} from "../../tipadosTs/horario";

/**
 * Componente Calendario semanal.
 *
 * Renderiza una grilla de horarios (horas × días de la semana) y determina
 * dinámicamente si cada celda contiene una clase asignada o está disponible.
 *
 * Funcionalidades:
 * - Muestra clases asignadas según día y hora de inicio.
 * - Permite seleccionar una clase existente para su modificación.
 * - Permite seleccionar una celda vacía para crear un nuevo horario.
 *
 * Lógica clave:
 * - Una celda se considera ocupada si existe una clase con el mismo
 *   `dia` y `hora_inicio`.
 * - Si no hay coincidencia, la celda se marca como disponible.
 *
 * Suposiciones de diseño:
 * - No existen clases superpuestas.
 * - Para una combinación (día + hora) solo puede existir una clase.
 * - Las clases se identifican por su hora de inicio.
 *
 * @param data.handleModData Callback ejecutado al seleccionar una clase existente.
 * @param data.handleAbrirModal Callback ejecutado al seleccionar una celda vacía.
 * @param data.horarios Lista de horas que conforman las filas del calendario.
 * @param data.diasSemana Lista de días que conforman las columnas del calendario.
 * @param data.calendario Listado de clases asignadas a renderizar.
 */

interface CalendarioProps {
  handleModData: (clase: ClaseHorario) => void;
  handleAbrirModal: (mensaje: MensajeCelda) => void;
  handleVolver: () => void;
  horarios: Horas[];
  diasSemana: DiaSemana[];
  calendario?: ClaseHorarioData[];
}

export const Calendario = (data: CalendarioProps) => {
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
              <th className="th_hora_label">Hora</th>
              {diasSemana.map((dia) => (
                <th key={dia}>{dia}</th>
              ))}
            </tr>
          </thead>

          <tbody className="cuerpo_calendario">
            {horarios.map((hora) => (
              <tr key={hora}>
                {/* Columna de hora lateral fija */}
                <td className="celda_hora_lateral">{hora}</td>

                {diasSemana.map((dia) => {
                  const clase = calendarioMap.get(`${dia}-${hora}`);

                  return (
                    <td key={dia} className="celda_interactiva">
                      {clase ? (
                        /* Contenedor estilo Post-it */
                        <div className="wrapper_clase_postit">
                          <ClaseAsignada
                            dia={dia}
                            hora={hora}
                            Horarios_Clases={calendario}
                            onSelect={data.handleModData}
                          />
                        </div>
                      ) : (
                        /* Contenedor que ocupa el 100% de la celda y centra el + */
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
