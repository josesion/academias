import React, { useEffect, useRef, useState } from "react";
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

/** Posición de la celda que tiene el foco, dentro de la grilla. */
interface PosicionCelda {
  /** Índice dentro de `horarios` (las filas). */
  fila: number;
  /** Índice dentro de `diasSemana` (las columnas). */
  col: number;
}

/**
 * Grilla de horarios: 16 franjas × 7 días = **112 celdas**, todas accionables
 * (alta de clase en las vacías, modificación en las ocupadas).
 *
 * Con 112 celdas, hacer cada una un `<button>` dejaría al usuario de teclado
 * tabular 112 veces para salir de la pantalla (WCAG 2.4.3). Por eso la grilla
 * es **una sola tabulación** y se recorre con las flechas (spec 014):
 *
 * - `<table role="grid">` + `role="row"` / `columnheader` / `rowheader` /
 *   `gridcell`.
 * - **Tabulación rotativa**: una sola celda tiene `tabIndex={0}`; el resto
 *   `-1`. El foco real se mueve con las flechas.
 * - `Enter` o `Espacio` activan la celda bajo el foco (igual que el click).
 * - Cada celda tiene `aria-label` con el día y la hora, para que el lector de
 *   voz diga "Agregar clase, martes a las 10:00" en vez de solo "+".
 *
 * El `onClick` vive en el `<td>`, no adentro: así hay un solo elemento
 * interactivo por celda.
 *
 * @param handleModData - Callback al activar una celda con clase asignada.
 * @param handleAbrirModal - Callback al activar una celda vacía.
 * @param handleVolver - Callback del botón "Volver".
 * @param horarios - Franjas horarias (filas).
 * @param diasSemana - Días (columnas).
 * @param calendario - Clases ya asignadas.
 */
export const Calendario: React.FC<CalendarioProps> = (data) => {
  const { horarios, diasSemana, calendario } = data;

  const calendarioMap = new Map<string, ClaseHorarioData>();

  calendario?.forEach((clase) => {
    calendarioMap.set(`${clase.dia}-${clase.hora_inicio}`, clase);
  });

  // Celda con el foco: arranca en la primera (lunes, 08:00)
  const [posicion, setPosicion] = useState<PosicionCelda>({ fila: 0, col: 0 });

  // Celdas montadas, para poder enfocarlas después de mover la posición
  const refCeldas = useRef<Map<string, HTMLTableCellElement>>(new Map());

  const claveCelda = (fila: number, col: number) => `${fila}-${col}`;

  // Tras mover la posición con las flechas, el foco real va a esa celda
  useEffect(() => {
    refCeldas.current.get(claveCelda(posicion.fila, posicion.col))?.focus();
  }, [posicion]);

  /** Activa una celda: si hay clase abre la modificación, si no el alta. */
  const activar = (fila: number, col: number) => {
    const hora = horarios[fila];
    const dia = diasSemana[col];

    if (!hora || !dia) return;

    const clase = calendarioMap.get(`${dia}-${hora}`);

    if (clase) {
      data.handleModData(clase);
    } else {
      data.handleAbrirModal({ mensaje: "+", dia, hora });
    }
  };

  /**
   * Teclado de la celda: flechas para moverse, Enter o Espacio para activar.
   *
   * @param evento - Evento de teclado de la celda.
   * @param fila - Fila de la celda.
   * @param col - Columna de la celda.
   */
  const alTeclado = (evento: React.KeyboardEvent, fila: number, col: number) => {
    switch (evento.key) {
      case "ArrowUp":
        evento.preventDefault();
        setPosicion({ fila: Math.max(0, fila - 1), col });
        return;

      case "ArrowDown":
        evento.preventDefault();
        setPosicion({ fila: Math.min(horarios.length - 1, fila + 1), col });
        return;

      case "ArrowLeft":
        evento.preventDefault();
        setPosicion({ fila, col: Math.max(0, col - 1) });
        return;

      case "ArrowRight":
        evento.preventDefault();
        setPosicion({ fila, col: Math.min(diasSemana.length - 1, col + 1) });
        return;

      case "Enter":
      case " ":
        evento.preventDefault();
        activar(fila, col);
        return;

      default:
        return;
    }
  };

  return (
    <div className="contenedor_calendario_completo">
      <div className="contenedor_calendario">
        <table className="tabla_calendario" role="grid" aria-label="Grilla de horarios">
          <thead className="cabecera_calendario">
            <tr role="row">
              {/* Esquina superior izquierda fija (sticky en ambas direcciones) */}
              <th className="th_hora_label esquina_fija" role="columnheader">
                Hora
              </th>
              {diasSemana.map((dia) => (
                <th key={dia} className="th_dia_sticky" role="columnheader">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="cuerpo_calendario">
            {horarios.map((hora, indiceFila) => (
              <tr key={hora} role="row">
                {/* Columna de hora lateral fija al hacer scroll horizontal */}
                <td className="celda_hora_lateral" role="rowheader">
                  {hora}
                </td>

                {diasSemana.map((dia, indiceCol) => {
                  const clase = calendarioMap.get(`${dia}-${hora}`);
                  const esFoco = posicion.fila === indiceFila && posicion.col === indiceCol;

                  return (
                    <td
                      key={dia}
                      ref={(elemento) => {
                        const clave = claveCelda(indiceFila, indiceCol);
                        if (elemento) {
                          refCeldas.current.set(clave, elemento);
                        } else {
                          refCeldas.current.delete(clave);
                        }
                      }}
                      role="gridcell"
                      tabIndex={esFoco ? 0 : -1}
                      aria-label={
                        clase
                          ? `${clase.tipo_clase} de ${clase.nivel}, ${dia} a las ${hora}. Ver o modificar.`
                          : `Agregar clase, ${dia} a las ${hora}`
                      }
                      className="celda_interactiva"
                      onClick={() => activar(indiceFila, indiceCol)}
                      onKeyDown={(evento) => alTeclado(evento, indiceFila, indiceCol)}
                    >
                      {clase ? (
                        <div className="wrapper_clase_postit">
                          <ClaseAsignada
                            dia={dia}
                            hora={hora}
                            Horarios_Clases={calendario}
                          />
                        </div>
                      ) : (
                        <div className="wrapper_celda_vacia">
                          <CeldaVacia dia={dia} hora={hora} mensaje="+" />
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