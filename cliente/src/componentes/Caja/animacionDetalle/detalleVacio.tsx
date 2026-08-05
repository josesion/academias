import "./detalleVacio.css";

interface CajaVaciaProps {
  mensaje?: string;
  submensaje?: string;
}

export const CajaVaciaAnimation = ({
  mensaje = "Sin movimientos registrados",
  submensaje = "El detalle se encuentra vacío en este momento.",
}: CajaVaciaProps) => {
  return (
    <div className="contenedor-vacio-animado">
      <div className="escena-animacion">
        {/* Estructura minimalista tipo documento / ticket financiero */}
        <div className="documento-flotante">
          <div className="doc-linea linea-titulo"></div>
          <div className="doc-linea linea-corta"></div>
          <div className="doc-linea"></div>
          <div className="doc-linea linea-media"></div>
          <div className="doc-badge-vacio">0.00</div>
        </div>
        {/* Sutil halo de luz ambiental */}
        <div className="halo-ambiental"></div>
      </div>

      <div className="texto-vacio">
        <p className="titulo-vacio">{mensaje}</p>
        <p className="subtitulo-vacio">{submensaje}</p>
      </div>
    </div>
  );
};
