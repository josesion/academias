import "./detalleVacio.css";

export const CajaVaciaAnimation = ({
  mensaje = "Nada en el detalle. ¡Empezá a agregar!",
}) => {
  return (
    <div className="contenedor-vacio-animado">
      <div className="escena-animacion">
        {/* La Bóveda / Caja Fuerte */}
        <div className="boveda-wrapper">
          <div className="boveda-cuerpo">
            <div className="boveda-puerta">
              <div className="boveda-dial">
                <div className="dial-centro"></div>
                <div className="dial-marca"></div>
              </div>
            </div>
            <div className="boveda-luz-neon"></div>
          </div>
        </div>

        {/* Elementos Flotantes (Datos vacíos) */}
        <div className="elemento-flotante dato-1"></div>
        <div className="elemento-flotante dato-2"></div>
        <div className="elemento-flotante dato-3"></div>
      </div>

      {/* Texto Descriptivo */}
      <div className="texto-vacio">
        <p className="titulo-vacio">{mensaje}</p>
        <p className="subtitulo-vacio">
          Tu caja espera las primeras operaciones.
        </p>
      </div>
    </div>
  );
};
