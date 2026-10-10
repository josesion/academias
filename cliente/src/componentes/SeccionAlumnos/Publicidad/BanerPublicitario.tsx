import React, { useEffect, useState } from "react";

import {
  Video,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Instagram,
  Facebook,
} from "lucide-react";

import "./galeriaComunidad.css";

/**
 * Red a la que apunta el botón del aviso. Es la ETIQUETA del anuncio, no la
 * dirección: la URL real sale de la columna de la empresa dueña del anuncio, y
 * si esa columna está en NULL el botón no se muestra.
 */
export type TipoContacto = "whatsapp" | "instagram" | "facebook";

export interface EmprendedorItem {
  id: number;
  nombre_emprendedor: string;
  titulo: string;
  descripcion: string;
  tipo: "imagen" | "video";
  url_media: string;
  /** Define el estilo del botón y su ícono (spec 019). */
  tipo_contacto?: TipoContacto;
  texto_boton?: string;
  /** Si no viene (o viene vacío), el botón NO se muestra. */
  link_accion?: string;
}

/**
 * Ícono e ícono+color de cada red.
 *
 * El color NO se aplica desde acá: va en el CSS por clase (`.wasap`, `.insta`,
 * `.face`), que es donde se controla el degradado de Instagram. Acá solo se
 * decide el ícono y el texto.
 */
const REDES: Record<
  TipoContacto,
  { icono: React.ComponentType<{ size?: number; color?: string }>; texto: string }
> = {
  whatsapp: { icono: MessageCircle, texto: "Consultar por WhatsApp" },
  instagram: { icono: Instagram, texto: "Ver en Instagram" },
  facebook: { icono: Facebook, texto: "Ver en Facebook" },
};

interface GaleriaComunidadProps {
  items: EmprendedorItem[];
  /** `true` mientras carga una página (spec 019). */
  cargando?: boolean;
  /** Aviso de error del listado. Si viene, se muestra en vez de la galería. */
  error?: string | null;
  /** TOTAL de anuncios en la BD (spec 019): lo usa el contador "X de Y". */
  total?: number;
  /**
   * Callback que se dispara cuando el usuario cierra el banner.
   * Útil para persistir la decisión (ej. localStorage) en el padre.
   */
  onClose?: () => void;
  /**
   * Visibilidad inicial del banner. Si es `false`, el banner no se renderiza.
   * Permite al padre controlar la visibilidad basándose en preferencias guardadas.
   * @default true
   */
  initiallyVisible?: boolean;
}

export const GaleriaComunidad: React.FC<GaleriaComunidadProps> = ({
  items,
  cargando = false,
  error = null,
  total,
  onClose,
  initiallyVisible = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(initiallyVisible);
  const [pausado, setPausado] = useState(false);

  const handleCerrar = () => {
    setVisible(false);
    onClose?.();
  };

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

  // Si el banner fue cerrado (por props o por usuario), no renderizar nada
  if (!visible) {
    return null;
  }

  // El aviso de error tiene prioridad: si el listado falló, se muestra el
  // motivo en lugar de una galería vacía sin explicación (spec 019).
  if (error) {
    return (
      <div className="galeria-comunidad-wrapper galeria-error" role="alert">
        <span className="galeria-error_titulo">No se pudieron cargar los anuncios</span>
        <span className="galeria-error_mensaje">{error}</span>
      </div>
    );
  }

  // Cargando y sin nada todavía: no se pinta la galería vacía mientras se
  // espera la primera respuesta (spec 019).
  if (items.length === 0) {
    if (cargando) {
      return (
        <div className="galeria-comunidad-wrapper galeria-cargando">
          <span className="galeria-cargando_texto">Cargando anuncios…</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="galeria-comunidad-wrapper galeria-flotante-wrapper"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <button
        className="btn-cerrar-flotante"
        onClick={handleCerrar}
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
            {/* Contador: "X de Y", donde Y es el TOTAL de anuncios que manda el
                servidor (no la cantidad cargada en pantalla). spec 019 */}
            <span className="galeria-contador">
              {currentIndex + 1} de {total ?? items.length}
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

                {/* Botón de contacto. Sin `link_accion` no se muestra: pasa
                    cuando la empresa dueña del anuncio no tiene esa red
                    cargada (columna en NULL). El estilo y el color por red los
                    pone la clase, no los props. */}
                {item.link_accion && item.link_accion.trim() !== "" && (
                  (() => {
                    const red = item.tipo_contacto
                      ? REDES[item.tipo_contacto]
                      : null;
                    const IconoRed = red ? red.icono : ExternalLink;
                    const claseRed = item.tipo_contacto
                      ? item.tipo_contacto
                      : "";

                    return (
                      <a
                        href={item.link_accion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn-emprendedor-accion ${claseRed}`}
                      >
                        <span>
                          {item.texto_boton ||
                            (red ? red.texto : "Ver más")}
                        </span>

                        <IconoRed size={14} />
                      </a>
                    );
                  })()
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

      {/* Aviso de carga al pie: mientras se pide la página siguiente el
          centinela sigue en pantalla, así que este texto es lo único que le
          dice al usuario que hay más y se están trayendo (spec 019). */}
      {cargando && (
        <div className="galeria-cargando-mas" aria-live="polite">
          Cargando más anuncios…
        </div>
      )}
    </div>
  );
};
