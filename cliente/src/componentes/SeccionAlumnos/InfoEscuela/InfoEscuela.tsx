import React, { useEffect, useId, useState } from "react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import "./infoescuela.css";

export interface EscuelaData {
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  razon_social: string;
  direccion: string;
  celular: string;
  /** Logo de la escuela (URL pública de R2). `null` si no tiene logo cargado. */
  urlImagen: string | null;
}

interface HeroEscuelaProps {
  escuela: EscuelaData;
  carga: boolean;
}

/**
 * Saca las iniciales que se muestran en el avatar de la academia cuando
 * no hay logo cargado (spec 037, ampliación 3).
 *
 * Reglas: con dos palabras o más toma la primera letra de las dos primeras
 * ("Academia Danza Latina" → "AD"); con una sola palabra toma sus dos
 * primeras letras ("Tango" → "TA"); si el texto viene vacío devuelve "DL".
 *
 * @param texto - Razón social de la academia.
 * @returns Las iniciales en mayúsculas.
 */
// Se exporta para reutilizarlo en la tarjeta de "Mis Academias" (spec 037,
// ampliación 3). La regla de fast-refresh pide que un archivo exporte solo
// componentes, pero la spec exige que el helper viva acá (no se crea un
// archivo nuevo ni se duplica la lógica).
// eslint-disable-next-line react-refresh/only-export-components
export const obtenerIniciales = (texto: string) => {
  if (!texto) return "DL";
  const palabras = texto.trim().split(" ");
  if (palabras.length > 1) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
  }
  return texto.substring(0, 2).toUpperCase();
};

/**
 * Cabecera de la ficha de la academia (pantalla `/data_escuela`).
 *
 * Muestra el **logo real** de la academia (`urlImagen`) con fallback al
 * avatar de iniciales de la razón social cuando la academia no tiene logo
 * o cuando la imagen falla al cargar (spec 037, ampliación 4). El logo es
 * decorativo (`alt=""`): el nombre ya está en el `<h2>` del hero.
 *
 * @param escuela - Datos de la academia (incluye `urlImagen`).
 * @param carga - Si está cargando.
 */
export const HeroEscuela: React.FC<HeroEscuelaProps> = ({ escuela, carga }) => {
  const [errorImagen, setErrorImagen] = useState(false);

  // Si cambia la academia, se reinicia el error: si no, el fallback
  // quedaría clavado en las iniciales.
  useEffect(() => {
    setErrorImagen(false);
  }, [escuela.urlImagen]);

  const heroId = useId();

  return (
    <div className="hero-escuela" aria-labelledby={heroId} tabIndex={0}>
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <>
          {escuela.urlImagen && !errorImagen ? (
            <img
              className="hero-logo"
              src={escuela.urlImagen}
              alt=""
              onError={() => setErrorImagen(true)}
            />
          ) : (
            <div className="hero-avatar" aria-hidden="true">
              {obtenerIniciales(escuela.razon_social)}
            </div>
          )}
          <div className="hero-info">
            <h2 id={heroId} className="hero-titulo">{escuela.razon_social}</h2>
            <p className="hero-sub">
              Propietario: {escuela.nombre_propietario}{" "}
              {escuela.apellido_propietario} • {escuela.direccion} • Tel:{" "}
              {escuela.celular}
            </p>
            <span className="badge-activo">Alumno Activo</span>
          </div>
        </>
      )}
    </div>
  );
};
