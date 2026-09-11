import React from "react";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import "./infoescuela.css";

export interface EscuelaData {
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  razon_social: string;
  direccion: string;
  celular: string;
}

interface HeroEscuelaProps {
  escuela: EscuelaData;
  carga: boolean;
}

export const HeroEscuela: React.FC<HeroEscuelaProps> = ({ escuela, carga }) => {
  // Función auxiliar para sacar las iniciales para el Avatar (ej: "Academia Danza" -> "AD")
  const obtenerIniciales = (texto: string) => {
    if (!texto) return "DL";
    const palabras = texto.trim().split(" ");
    if (palabras.length > 1) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return texto.substring(0, 2).toUpperCase();
  };

  return (
    <div className="hero-escuela">
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <>
          <div className="hero-avatar">
            {obtenerIniciales(escuela.razon_social)}
          </div>
          <div className="hero-info">
            <h1 className="hero-titulo">{escuela.razon_social}</h1>
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
