import { LuClock, LuMapPin, LuUser } from "react-icons/lu";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";

import "./tarjetaclasehoy.css";

export interface TarjetaClaseHoyProps {
  hora: string;
  academia: string;
  tipoBaile: string;
  nivel: string;
  profesor: string;
  carga: boolean;
}

export const TarjetaClaseHoy = ({
  hora,
  academia,
  tipoBaile,
  nivel,
  profesor,
  carga,
}: TarjetaClaseHoyProps) => {
  return (
    <div className="tarjeta_clase">
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <>
          <div className="tarjeta_clase_hora">
            <LuClock size={16} />
            <span>{hora}</span>
          </div>

          <div className="tarjeta_clase_cuerpo">
            <div className="tarjeta_clase_titulo_fila">
              <h3 className="tarjeta_clase_baile">{tipoBaile}</h3>
              <span className="tarjeta_clase_nivel">{nivel}</span>
            </div>

            <p className="tarjeta_clase_academia">
              <LuMapPin size={14} />
              {academia}
            </p>

            <p className="tarjeta_clase_profesor">
              <LuUser size={14} />
              {profesor}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
