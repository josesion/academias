import React, { useState } from "react";
import { Calendar, CalendarRange, Menu, X } from "lucide-react";

import "./filtrosFechas.css";

interface FiltroFechasProps {
  fechaDesde: string;
  fechaHasta: string;
  onDesdeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHastaChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FiltroFechas: React.FC<FiltroFechasProps> = ({
  fechaDesde,
  fechaHasta,
  onDesdeChange,
  onHastaChange,
}) => {
  const [abierto, setAbierto] = useState(false);

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
            <label>Desde</label>
            <div className="input_wrapper">
              <Calendar size={16} className="input_icon" />
              <input type="date" value={fechaDesde} onChange={onDesdeChange} />
            </div>
          </div>

          <div className="filtro_separador">-</div>

          <div className="filtro_input_group">
            <label>Hasta</label>
            <div className="input_wrapper">
              <Calendar size={16} className="input_icon" />
              <input type="date" value={fechaHasta} onChange={onHastaChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
