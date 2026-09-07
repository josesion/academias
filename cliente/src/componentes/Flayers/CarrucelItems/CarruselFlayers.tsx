import { useState, useEffect } from "react";
import { LuChevronLeft, LuChevronRight, LuImageOff } from "react-icons/lu";
import { EstadoVacio } from "../../SeccionAlumnos/EstadoVacio/EstadoVacio";

import "./carrucelsolo.css";

export interface Flayer {
  id_flayer: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

interface CarruselProps {
  flayers: Flayer[] | null;
}

export const CarruselSolo = ({ flayers }: CarruselProps) => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  // * Temporizador automático
  useEffect(() => {
    if (!flayers || flayers.length <= 1 || pausado) return;
    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev === flayers.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(intervalo);
  }, [flayers, pausado]);

  // * Estado vacío
  if (!flayers || flayers.length === 0) {
    return (
      <div className="carrusel_lineal_contenedor">
        <EstadoVacio
          variante="grande"
          icono={<LuImageOff size={34} />}
          titulo="Sin flyers por el momento"
          mensaje="Cuando las academias publiquen novedades, van a aparecer acá."
        />
      </div>
    );
  }

  const total = flayers.length;

  const irAnterior = () =>
    setIndiceActual(indiceActual === 0 ? total - 1 : indiceActual - 1);
  const irSiguiente = () =>
    setIndiceActual(indiceActual === total - 1 ? 0 : indiceActual + 1);

  const flayerActual = flayers[indiceActual];

  return (
    <div
      className="carrusel_lineal_contenedor"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* PISTA */}
      <div className="carrusel_lineal_marco">
        <div
          className="carrusel_lineal_pista"
          style={{ transform: `translateX(-${indiceActual * 100}%)` }}
        >
          {flayers.map((flayer) => (
            <div key={flayer.id_flayer} className="carrusel_lineal_slide">
              <div
                className="carrusel_lineal_fondo_blur"
                style={{ backgroundImage: `url(${flayer.imagen_url})` }}
              />
              <img src={flayer.imagen_url} alt={flayer.titulo} />
            </div>
          ))}
        </div>

        {/* Flechas superpuestas a los bordes */}
        {total > 1 && (
          <>
            <button
              className="carrusel_lineal_btn carrusel_lineal_btn_izq"
              onClick={irAnterior}
              aria-label="Anterior"
            >
              <LuChevronLeft size={20} />
            </button>
            <button
              className="carrusel_lineal_btn carrusel_lineal_btn_der"
              onClick={irSiguiente}
              aria-label="Siguiente"
            >
              <LuChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* INFORMACIÓN + DOTS */}
      <div className="carrusel_lineal_pie">
        <div className="carrusel_lineal_info">
          <h3 className="carrusel_lineal_titulo">{flayerActual?.titulo}</h3>
          <p className="carrusel_lineal_descripcion">
            {flayerActual?.descripcion}
          </p>
        </div>

        {total > 1 && (
          <div className="carrusel_lineal_dots">
            {flayers.map((_, i) => (
              <span
                key={i}
                className={`carrusel_lineal_dot ${
                  i === indiceActual ? "activo" : ""
                }`}
                onClick={() => setIndiceActual(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
