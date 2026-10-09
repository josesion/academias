import { Link } from "react-router-dom";
import { LuMapPin, LuPhone, LuIdCard } from "react-icons/lu";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";

import "./tarjetaescuela.css";

export interface TarjetaEscuelaProps {
  id_escuela: number; // Ahora es requerido para asegurar que siempre esté presente
  dniPropietario: number;
  nombrePropietario: string;
  apellidoPropietario: string;
  razonSocial: string;
  direccion: string;
  celular: string;
  carga: boolean;
}

/**
 * Tarjeta de una academia, en la pantalla "Mis Academias" del alumno.
 *
 * La tarjeta es un `<Link to="/data_escuela" state={{ id_escuela }}>` (spec
 * 014): antes era un `<div onClick>`, que no se podía tabular ni activar con
 * Enter. `DataEscual` sigue leyendo el id de `location.state`, así que la
 * navegación es idéntica.
 *
 * @param id_escuela - Id de la academia (viaja en el state del Link).
 * @param dniPropietario - DNI del propietario.
 * @param nombrePropietario - Nombre del propietario.
 * @param apellidoPropietario - Apellido del propietario.
 * @param razonSocial - Nombre de la academia.
 * @param direccion - Dirección.
 * @param celular - Celular de contacto.
 * @param carga - Si está cargando.
 */
export const TarjetaEscuela = ({
  id_escuela,
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
    <Link
      className="tarjeta_escuela"
      to="/data_escuela"
      state={{ id_escuela }}
    >
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
    </Link>
  );
};
