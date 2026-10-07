import { useState, useEffect, type FocusEvent } from "react";
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

  // * Con más de un flyer el carrusel avanza solo; con uno solo no tiene sentido
  const enAutomatico = total > 1;

  const irAnterior = () =>
    setIndiceActual(indiceActual === 0 ? total - 1 : indiceActual - 1);
  const irSiguiente = () =>
    setIndiceActual(indiceActual === total - 1 ? 0 : indiceActual + 1);

  const flayerActual = flayers[indiceActual];

  // * Al tabular dentro del carrusel se pausa; al salir del todo se reanuda.
  //   (onBlurCapture salta entre hijos, por eso se chequea relatedTarget)
  const alPerderFoco = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setPausado(false);
    }
  };

  return (
    <div
      className={[
        "carrusel_lineal_contenedor",
        enAutomatico ? "carrusel_lineal_auto" : "",
        pausado ? "carrusel_lineal_pausado" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={alPerderFoco}
    >
      {/* PISTA */}
      <div className="carrusel_lineal_marco">
        <div
          className="carrusel_lineal_pista"
          style={{ transform: `translateX(-${indiceActual * 100}%)` }}
        >
          {flayers.map((flayer, i) => (
            <div
              key={flayer.id_flayer}
              className={`carrusel_lineal_slide${
                i === indiceActual ? " activo" : ""
              }`}
            >
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

      {/* BARRA DE PROGRESO DEL AVANCE AUTOMÁTICO (se re-monta en cada
          cambio de índice para reiniciar la animación) */}
      {enAutomatico && (
        <i className="carrusel_lineal_barra" key={indiceActual} aria-hidden="true" />
      )}

      {/* INFORMACIÓN + DOTS */}
      <div className="carrusel_lineal_pie">
        <div className="carrusel_lineal_info">
          <h3
            className="carrusel_lineal_titulo"
            key={`titulo-${flayerActual?.id_flayer}`}
          >
            {flayerActual?.titulo}
          </h3>
          <p
            className="carrusel_lineal_descripcion"
            key={`descripcion-${flayerActual?.id_flayer}`}
          >
            {flayerActual?.descripcion}
          </p>
        </div>

        {total > 1 && (
          <div className="carrusel_lineal_dots">
            {flayers.map((flayer, i) => (
              <button
                key={flayer.id_flayer}
                type="button"
                className={`carrusel_lineal_dot${
                  i === indiceActual ? " activo" : ""
                }`}
                onClick={() => setIndiceActual(i)}
                aria-label={`Ir al flyer ${i + 1}`}
                aria-current={i === indiceActual ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
