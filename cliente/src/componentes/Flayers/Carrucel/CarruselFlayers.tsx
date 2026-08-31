import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuImageOff } from "react-icons/lu";

import "./carruselflayers.css";

// Mock: en la versión final vendrá del backend
const flayersMock = [
  {
    id: 1,
    titulo: "Fall Session - Contemporary",
    descripcion:
      "Flyer promocional para la sesión de otoño de danza contemporánea.",
    imagenUrl:
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&q=80",
  },
  {
    id: 2,
    titulo: "Ballet Clásico - Invierno",
    descripcion:
      "Presentación de fin de trimestre del elenco de ballet clásico.",
    imagenUrl:
      "https://images.unsplash.com/photo-1533000759938-aa0ba70beceb?w=600&q=80",
  },
  {
    id: 3,
    titulo: "Salsa & Latin Night",
    descripcion:
      "Noche especial de ritmos latinos abierta a todos los niveles.",
    imagenUrl:
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&q=80",
  },
  {
    id: 4,
    titulo: "Hip Hop Intensive",
    descripcion: "Taller intensivo de hip hop con coreógrafo invitado.",
    imagenUrl:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&q=80",
  },
];

export const CarruselFlayers = () => {
  const [indiceActual, setIndiceActual] = useState(0);

  const total = flayersMock.length;

  if (total === 0) {
    return (
      <div className="carrusel_contenedor">
        <div className="carrusel_lienzo carrusel_lienzo_vacio">
          <LuImageOff size={32} />
          <span>Sin Flyers por el momento</span>
        </div>
      </div>
    );
  }

  const flayerActual = flayersMock[indiceActual];

  const irAnterior = () => {
    setIndiceActual((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const irSiguiente = () => {
    setIndiceActual((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  return (
    <div className="carrusel_contenedor">
      <div className="carrusel_lienzo">
        <img
          key={flayerActual.id}
          src={flayerActual.imagenUrl}
          alt={flayerActual.titulo}
          className="carrusel_imagen"
        />
      </div>

      <div className="carrusel_info">
        <p className="carrusel_titulo">{flayerActual.titulo}</p>
        <p className="carrusel_descripcion">{flayerActual.descripcion}</p>
      </div>

      <div className="carrusel_controles">
        <button
          className="carrusel_btn_flecha"
          type="button"
          onClick={irAnterior}
          aria-label="Flyer anterior"
        >
          <LuChevronLeft size={18} />
        </button>

        <div className="carrusel_dots">
          {flayersMock.map((flayer, i) => (
            <span
              key={flayer.id}
              className={`carrusel_dot ${i === indiceActual ? "activo" : ""}`}
            />
          ))}
        </div>

        <button
          className="carrusel_btn_flecha"
          type="button"
          onClick={irSiguiente}
          aria-label="Flyer siguiente"
        >
          <LuChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
