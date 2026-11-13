import "./infoclases.css";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";

interface DataClases {
  nombre_clase: string;
  horario: string;
  nombre_profesor: string;
  estado: "EN CURSO" | "SIN CURSO";
  carga: boolean;
}

export const InfoClases = ({
  nombre_clase,
  horario,
  nombre_profesor,
  estado,
  carga,
}: DataClases) => {
  return (
    <header className="info_clases_contenedor">
      <div className="info_clases_datos">
        <div className="info_clases_item">
          <span className="info_clases_label">Clase</span>

          {carga ? (
            <SpinnerTarjeta />
          ) : (
            <h2 title={nombre_clase}>{nombre_clase}</h2>
          )}
        </div>

        <div className="info_clases_divisor"></div>

        <div className="info_clases_item">
          <span className="info_clases_label">Horario</span>

          {carga ? <SpinnerTarjeta /> : <p title={horario}>{horario}</p>}
        </div>

        <div className="info_clases_divisor"></div>

        <div className="Info_clases_item">
          <span className="info_clases_label">Profesor</span>

          {carga ? (
            <SpinnerTarjeta />
          ) : (
            <p title={nombre_profesor}>{nombre_profesor}</p>
          )}
        </div>
      </div>

      <div
        className={`info_clases_estado ${
          estado === "EN CURSO" ? "curso" : "sin_curso"
        }`}
      >
        <span className="estado_punto"></span>
        {estado}
      </div>
    </header>
  );
};
