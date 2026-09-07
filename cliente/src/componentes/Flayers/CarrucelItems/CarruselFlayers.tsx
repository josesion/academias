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
      <div className="carrusel_pro_contenedor">
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

  // * Lógica matemática adaptativa según la cantidad de flyers
  const getClasePosicion = (index: number) => {
    if (total === 1) return index === indiceActual ? "activa" : "oculta";

    if (index === indiceActual) return "activa";

    const prev1 = (indiceActual - 1 + total) % total;
    const next1 = (indiceActual + 1) % total;

    if (index === prev1) return "prev1";
    if (index === next1) return "next1";

    const prev2 = (indiceActual - 2 + total) % total;
    const next2 = (indiceActual + 2) % total;

    // Si tenemos exactamente 4 elementos, manejamos el cuarto elemento sin solaparse
    if (total === 4) {
      if (index === prev2) return "prev2";
    }

    // Si tenemos 5 o más, aplicamos la estructura completa de 2 y 2
    if (total >= 5) {
      if (index === prev2) return "prev2";
      if (index === next2) return "next2";
    }

    return "oculta";
  };

  const flayerActual = flayers[indiceActual];

  return (
    <div
      className="carrusel_pro_contenedor"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* PISTA */}
      <div className="carrusel_pro_pista">
        {flayers.map((flayer, index) => {
          const clasePosicion = getClasePosicion(index);
          return (
            <div
              key={flayer.id_flayer}
              className={`carrusel_pro_item ${clasePosicion}`}
              onClick={() => setIndiceActual(index)}
            >
              <div
                className="carrusel_pro_fondo_blur"
                style={{ backgroundImage: `url(${flayer.imagen_url})` }}
              />
              <img src={flayer.imagen_url} alt={flayer.titulo} />
              <div className="carrusel_pro_overlay" />
            </div>
          );
        })}
      </div>

      {/* INFORMACIÓN DEL FLYER CENTRAL */}
      <div className="carrusel_pro_info">
        <h3 className="carrusel_pro_titulo">{flayerActual?.titulo}</h3>
        <p className="carrusel_pro_descripcion">{flayerActual?.descripcion}</p>
      </div>

      {/* CONTROLES */}
      {total > 1 && (
        <div className="carrusel_pro_controles">
          <button
            className="carrusel_pro_btn"
            onClick={irAnterior}
            aria-label="Anterior"
          >
            <LuChevronLeft size={22} />
          </button>

          <div className="carrusel_pro_dots">
            {flayers.map((_, i) => (
              <span
                key={i}
                className={`carrusel_pro_dot ${i === indiceActual ? "activo" : ""}`}
                onClick={() => setIndiceActual(i)}
              />
            ))}
          </div>

          <button
            className="carrusel_pro_btn"
            onClick={irSiguiente}
            aria-label="Siguiente"
          >
            <LuChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  );
};
