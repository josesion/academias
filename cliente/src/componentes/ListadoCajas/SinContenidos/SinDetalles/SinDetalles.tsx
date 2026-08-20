import { Receipt } from "lucide-react";
import "./sindetalles.css";

export const SinDetallesCaja = () => {
  return (
    <div className="sin_detalles_contenedor">
      <div className="sin_detalles_icono">
        <Receipt size={26} />
      </div>

      <p className="sin_detalles_titulo">Sin detalles para mostrar</p>
      <span className="sin_detalles_subtitulo">
        Todavía no hay movimientos registrados para esta caja.
      </span>
    </div>
  );
};
