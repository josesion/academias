import { LuMapPin, LuPhone, LuIdCard } from "react-icons/lu";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";

import "./tarjetaescuela.css";

export interface TarjetaEscuelaProps {
  id_escuela?: number;
  dniPropietario: number;
  nombrePropietario: string;
  apellidoPropietario: string;
  razonSocial: string;
  direccion: string;
  celular: string;
  carga: boolean;
}

export const TarjetaEscuela = ({
  dniPropietario,
  nombrePropietario,
  apellidoPropietario,
  razonSocial,
  direccion,
  celular,
  carga,
}: TarjetaEscuelaProps) => {
  const iniciales = `${nombrePropietario.charAt(0)}${apellidoPropietario.charAt(0)}`;

  return (
    <div className="tarjeta_escuela">
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <div>
          <div className="tarjeta_escuela_header">
            <div className="tarjeta_escuela_avatar">{iniciales}</div>
            <div className="tarjeta_escuela_header_texto">
              <h3 className="tarjeta_escuela_razon">{razonSocial}</h3>
              <p className="tarjeta_escuela_propietario">
                {nombrePropietario} {apellidoPropietario}
              </p>
            </div>
          </div>

          <div className="tarjeta_escuela_divisor" />

          <ul className="tarjeta_escuela_datos">
            <li>
              <LuIdCard size={16} />
              <span>DNI {dniPropietario}</span>
            </li>
            <li>
              <LuMapPin size={16} />
              <span>{direccion}</span>
            </li>
            <li>
              <LuPhone size={16} />
              <span>{celular}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
