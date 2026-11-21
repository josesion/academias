import React, { useEffect, useRef, useState } from "react";
import type { ClaseHorarioGymData, DiaSemana, Horas } from "../../tipadosTs/horario_gym";
import { type MensajeCelda } from "../Horarios/CeldaVacia/CeldaVacia";
import { CeldaVacia } from "../Horarios/CeldaVacia/CeldaVacia";
import { ClaseAsignadaGym } from "./ClaseAsignadaGym/ClaseAsignadaGym";
import { Boton } from "../../componentes/generales/Boton/Boton";
import { AlertCircle } from "lucide-react";

import "../Horarios/Calendario/calendario.css";

interface CalendarioGymProps {
  diasSemana: DiaSemana[];
  horarios: Horas[];
  calendario: ClaseHorarioGymData[];
  handleModData: (clase: any) => void;
  handleAbrirModal: (mensaje: MensajeCelda) => void;
  handleVolver: () => void;
}

interface PosicionCelda {
  fila: number;
  col: number;
}

/**
 * Grilla de horarios del Gym: 16 franjas × 7 días = 112 celdas.
 * Usa la misma estructura que el calendario de Baile para consistencia visual.
 */
export const CalendarioGym: React.FC<CalendarioGymProps> = (props) => {
  const { diasSemana, horarios, calendario, handleModData, handleAbrirModal, handleVolver } = props;

  // Normalizar horas del calendario para matchear con la grilla
  // El backend puede devolver "08:00:00" (con segundos) o "08:00" (sin segundos).
  // La grilla usa formato "08:00", así que removemos solo los segundos si existen.
  const calendarioMap = new Map<string, ClaseHorarioGymData>();
  calendario?.forEach((clase) => {
    const horaNormalizada = clase.hora_inicio.replace(":00:00", ":00");
    calendarioMap.set(`${clase.dia_semana}-${horaNormalizada}`, clase);
  });

  const [posicion, setPosicion] = useState<PosicionCelda>({ fila: 0, col: 0 });
  const refCeldas = useRef<Map<string, HTMLTableCellElement>>(new Map());
  const claveCelda = (fila: number, col: number) => `${fila}-${col}`;

  useEffect(() => {
    refCeldas.current.get(claveCelda(posicion.fila, posicion.col))?.focus();
  }, [posicion]);

  const activar = (fila: number, col: number) => {
    const hora = horarios[fila];
    const dia = diasSemana[col];
    if (!hora || !dia) return;

    const clase = calendarioMap.get(`${dia}-${hora}`);
    if (clase) {
      handleModData({
        id_horario: clase.id_horario,
        id_sala: clase.id_sala,
        sala_nombre: clase.sala_nombre,
        id_clase: clase.id_tipo_clase || 0,
        tipo_clase: clase.tipo_clase_descripcion || "",
        id_nivel: 0,
        nivel: "",
        dni_profe: clase.dni_profesor || "",
        profesor: clase.profesor_apellido || "",
        nombre: clase.profesor_nombre || "",
        dia: clase.dia_semana,
        hora_inicio: clase.hora_inicio,
        hora_fin: clase.hora_fin,
        estado: clase.estado as "activos" | "inactivos",
      });
    } else {
      handleAbrirModal({ mensaje: "+", dia, hora });
    }
  };

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
      {/* Mensaje cuando no hay clases asignadas */}
      {(!calendario || calendario.length === 0) && (
        <div className="calendario_vacio" role="status">
          <AlertCircle size={20} aria-hidden="true" />
          <p>No hay clases asignadas en esta sala. Hacé clic en una celda para agregar la primera.</p>
        </div>
      )}
      <div className="contenedor_calendario">
        <table
          className="tabla_calendario"
          role="grid"
          aria-label="Grilla de horarios Gym"
          title="Usá las flechas del teclado para navegar, Enter o Espacio para seleccionar"
        >
          <thead className="cabecera_calendario">
            <tr role="row">
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
                          ? `${clase.sala_nombre}, ${dia} a las ${hora}. Ver o modificar.`
                          : `Agregar clase, ${dia} a las ${hora}`
                      }
                      className="celda_interactiva"
                      onClick={() => activar(indiceFila, indiceCol)}
                      onKeyDown={(evento) => alTeclado(evento, indiceFila, indiceCol)}
                    >
                      {clase ? (
                        <div className="wrapper_clase_postit">
                          <ClaseAsignadaGym
                            sala_nombre={clase.sala_nombre}
                            profesor_apellido={clase.profesor_apellido}
                            profesor_nombre={clase.profesor_nombre}
                            tipo_clase={clase.tipo_clase_descripcion}
                            estado={clase.estado}
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
          texto="Volver al panel principal"
          onClick={handleVolver}
        />
      </div>
    </div>
  );
};
