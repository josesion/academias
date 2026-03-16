import React from "react";
import { Calendar } from "lucide-react";

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
  return (
    <div className="filtro_fechas_contenedor">
      {/* Campo Desde */}
      <div className="filtro_input_group">
        <label>Desde</label>
        <div className="input_wrapper">
          <Calendar size={16} className="input_icon" />
          <input type="date" value={fechaDesde} onChange={onDesdeChange} />
        </div>
      </div>

      <div className="filtro_separador">-</div>

      {/* Campo Hasta */}
      <div className="filtro_input_group">
        <label>Hasta</label>
        <div className="input_wrapper">
          <Calendar size={16} className="input_icon" />
          <input type="date" value={fechaHasta} onChange={onHastaChange} />
        </div>
      </div>
    </div>
  );
};
