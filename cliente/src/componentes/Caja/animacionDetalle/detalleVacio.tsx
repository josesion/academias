import React from "react";
import "./detalleVacio.css";

interface CajaVaciaProps {
  mensaje?: string;
  submensaje?: string;
}

export const CajaVaciaAnimation: React.FC<CajaVaciaProps> = ({
  mensaje = "Sin movimientos registrados",
  submensaje = "El detalle se encuentra vacío en este momento.",
}) => {
  return (
    <div className="contenedor_vacio_animado">
      <div className="escena_animacion">
        {/* Estructura minimalista tipo documento / ticket financiero */}
        <div className="documento_flotante">
          <div className="doc_linea linea_titulo"></div>
          <div className="doc_linea linea_corta"></div>
          <div className="doc_linea"></div>
          <div className="doc_linea linea_media"></div>
          <div className="doc_badge_vacio">0.00</div>
        </div>
        {/* Sutil halo de luz ambiental */}
        <div className="halo_ambiental"></div>
      </div>

      <div className="texto_vacio">
        <p className="titulo_vacio">{mensaje}</p>
        <p className="subtitulo_vacio">{submensaje}</p>
      </div>
    </div>
  );
};
