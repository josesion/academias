import React, { useEffect, useState } from "react";

import {
  Video,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import "./galeriaComunidad.css";

export interface EmprendedorItem {
  id: number;
  nombre_emprendedor: string;
  titulo: string;
  descripcion: string;
  tipo: "imagen" | "video";
  url_media: string;
  texto_boton?: string;
  link_accion?: string;
}

interface GaleriaComunidadProps {
  items: EmprendedorItem[];
}

export const GaleriaComunidad: React.FC<GaleriaComunidadProps> = ({
  items,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [pausado, setPausado] = useState(false);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (items.length <= 1 || !visible || pausado) return;

    const intervalo = setInterval(() => {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(intervalo);
  }, [items.length, visible, pausado]);

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  if (!visible || !items || items.length === 0) return null;

  return (
    <div
      className="galeria-comunidad-wrapper galeria-flotante-wrapper"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <button
        className="btn-cerrar-flotante"
        onClick={() => setVisible(false)}
        aria-label="Cerrar espacio publicitario"
        title="Cerrar"
      >
        <X size={16} />
      </button>

      <div className="galeria-comunidad-header">
        <div>
          <span className="comunidad-tag">Espacio Publicitario</span>
        </div>

        {items.length > 1 && (
          <div className="galeria-controles">
            <span className="galeria-contador">
              {currentIndex + 1} / {items.length}
            </span>

            <button
              className="btn-control"
              onClick={prevSlide}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              className="btn-control"
              onClick={nextSlide}
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="galeria-viewport">
        <div
          className="galeria-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="galeria-card">
              <div className="media-container">
                {item.tipo === "video" ? (
                  <video
                    src={item.url_media}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="media-elemento"
                  />
                ) : (
                  <img
                    src={item.url_media}
                    alt={item.titulo}
                    loading="lazy"
                    className="media-elemento"
                  />
                )}

                <div className="tipo-badge">
                  {item.tipo === "video" ? (
                    <Video size={13} />
                  ) : (
                    <ImageIcon size={13} />
                  )}

                  <span>{item.tipo === "video" ? "Video / Reel" : "Foto"}</span>
                </div>
              </div>

              <div className="galeria-info">
                <span className="nombre-emprendedor">
                  {item.nombre_emprendedor}
                </span>

                <h4 className="item-titulo">{item.titulo}</h4>

                <p className="item-descripcion">{item.descripcion}</p>

                {item.link_accion && (
                  <a
                    href={item.link_accion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-emprendedor-accion"
                  >
                    <span>{item.texto_boton || "Ver más"}</span>

                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <div className="galeria-dots">
          {items.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir a item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
