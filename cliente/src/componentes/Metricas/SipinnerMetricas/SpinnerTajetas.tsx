import "./spinnerTarjetas.css";

export const SpinnerTarjeta = () => {
  return (
    <div className="spinner_tarjeta">
      <div className="spinner_tarjeta_loader"></div>

      <div className="spinner_tarjeta_texto">
        Cargando métricas...
      </div>
    </div>
  );
};