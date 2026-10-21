import React, { useState } from "react";
import { Calendar, CalendarRange, Menu, X } from "lucide-react";

import "./filtrosFechas.css";

interface FiltroFechasProps {
  fechaDesde: string;
  fechaHasta: string;
  onDesdeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHastaChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Impide que el campo de fecha quede vacío.
   *
   * Con `true`, al borrar la fecha se **restaura el valor anterior** y no se
   * avisa al padre (no hay cambio de estado ni petición). Con `false`
   * (default) el vacío se propaga y sirve como "sin filtro" — así lo usa la
   * pantalla de Anuncios, donde las fechas son opcionales.
   */
  impedirVacio?: boolean;
}

/**
 * Filtro de rango de fechas (desde / hasta) con dos `input[type="date"]`.
 *
 * El componente **no guarda estado propio de las fechas**: es controlado por
 * el padre, que le pasa `fechaDesde` / `fechaHasta` y recibe los cambios por
 * `onDesdeChange` / `onHastaChange`. Lo único que state-local tiene es el
 * desplegable en mobile (`.filtro_fechas_toggle`).
 *
 * @param props - Fechas controladas y callbacks de cambio.
 * @returns El bloque del filtro de fechas.
 */
export const FiltroFechas: React.FC<FiltroFechasProps> = ({
  fechaDesde,
  fechaHasta,
  onDesdeChange,
  onHastaChange,
  impedirVacio = false,
}) => {
  const [abierto, setAbierto] = useState(false);

  /**
   * Intercepta el cambio del campo "Desde".
   *
   * Si el campo queda vacío y `impedirVacio` está activo, se restaura la
   * fecha anterior **en el propio input** (el componente es controlado y sin
   * un cambio de estado React no lo volvería a pintar) y no se llama al
   * callback del padre, así que no se dispara ninguna petición.
   *
   * @param event - ChangeEvent del input de fecha "Desde".
   */
  const manejarDesde = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ( impedirVacio && event.target.value === "" ){
      event.target.value = fechaDesde;
      return;
    }
    onDesdeChange?.(event);
  };

  /**
   * Intercepta el cambio del campo "Hasta" (mismo criterio que "Desde").
   *
   * @param event - ChangeEvent del input de fecha "Hasta".
   */
  const manejarHasta = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ( impedirVacio && event.target.value === "" ){
      event.target.value = fechaHasta;
      return;
    }
    onHastaChange?.(event);
  };

  return (
    <div className={`filtro_fechas_wrapper ${abierto ? "abierto" : ""}`}>
      <div className="filtro_fechas_encabezado">
        <p className="filtro_fechas_titulo">
          <CalendarRange size={13} />
          Filtrar por fecha
        </p>

        <button
          type="button"
          className="filtro_fechas_toggle"
          onClick={() => setAbierto((prev) => !prev)}
          aria-expanded={abierto}
          aria-label={
            abierto ? "Ocultar filtro de fechas" : "Mostrar filtro de fechas"
          }
        >
          {abierto ? <X size={16} /> : <Menu size={16} />}
          <span>Filtros</span>
        </button>
      </div>

      <div className="filtro_fechas_colapsable">
        <div className="filtro_fechas_contenedor">
          <div className="filtro_input_group">
            {/* El `htmlFor` + el `id` del input son los que asocian el rótulo con
                el campo (spec 016): sin ellos el lector de voz no anuncia de
                qué campo se trata. */}
            <label htmlFor="filtro_fecha_desde">Desde</label>
            <div className="input_wrapper">
              <Calendar size={16} className="input_icon" />
              <input
                id="filtro_fecha_desde"
                type="date"
                aria-label="Filtrar desde la fecha"
                value={fechaDesde}
                onChange={manejarDesde}
              />
            </div>
          </div>

          <div className="filtro_separador">-</div>

          <div className="filtro_input_group">
            <label htmlFor="filtro_fecha_hasta">Hasta</label>
            <div className="input_wrapper">
              <Calendar size={16} className="input_icon" />
              <input
                id="filtro_fecha_hasta"
                type="date"
                aria-label="Filtrar hasta la fecha"
                value={fechaHasta}
                onChange={manejarHasta}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
