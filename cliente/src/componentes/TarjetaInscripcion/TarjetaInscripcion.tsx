import "./tarjeta.css";
import { fechaVencimiento, fechaHoy } from "../../hooks/fecha";
import { type DataPlan, type DataAlumno } from "../../tipadosTs/inscripciones";

interface PropsTarjeta {
  plan: DataPlan | null;
  alumno: DataAlumno | null;
}

export const TarjetaInscripcion = ({ plan, alumno }: PropsTarjeta) => {
  const meses = plan?.meses ?? 0;

  return (
    <div className="tarjeta_card">
      <p className="tarjeta_titulo">Estado de inscripción</p>

      {/* Datos principales */}
      <div className="tarjeta_card_body">
        <div className="tarjeta_row">
          <span className="tarjeta_key">Plan</span>
          <span className="tarjeta_value">
            {plan?.descripcion ?? "Ninguno"}
          </span>
        </div>

        <div className="tarjeta_row">
          <span className="tarjeta_key">Alumno</span>
          <span className="tarjeta_value">
            {alumno
              ? `${alumno.Apellido} ${alumno.Nombre} (${alumno.Dni})`
              : "No seleccionado"}
          </span>
        </div>

        <div className="tarjeta_row">
          <span className="tarjeta_key">Fecha inscripción</span>
          <span className="tarjeta_value">{fechaHoy()}</span>
        </div>

        <div className="tarjeta_row">
          <span className="tarjeta_key">Fecha vencimiento</span>
          <span className="tarjeta_value">
            {plan ? fechaVencimiento(meses) : "—"}
          </span>
        </div>

        <div className="tarjeta_row">
          <span className="tarjeta_key">Clases</span>
          <span className="tarjeta_value">{plan?.clases ?? 0}</span>
        </div>

        <div className="tarjeta_row">
          <span className="tarjeta_key">Meses</span>
          <span className="tarjeta_value">{plan?.meses ?? 0}</span>
        </div>

        <div className="tarjeta_row destacado">
          <span className="tarjeta_key">Precio</span>
          <span className="tarjeta_value">$ {plan?.monto ?? "0.00"}</span>
        </div>
      </div>
    </div>
  );
};
