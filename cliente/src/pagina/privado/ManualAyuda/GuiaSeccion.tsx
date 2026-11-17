import { Link } from "react-router-dom";
import { useState } from "react";
import "./guia-seccion.css";

/**
 * Datos de un paso de la guía.
 */
export interface PasoGuia {
  /** Número del paso (se muestra automáticamente, este campo es para orden). */
  numero: number;
  /** Título corto del paso. */
  titulo: string;
  /** Descripción detallada de qué hacer en este paso. */
  descripcion: string;
  /** Nombre del archivo de imagen (sin extensión) en la carpeta correspondiente. */
  imagen: string;
  /** Nota opcional que se muestra debajo de la imagen. */
  nota?: string;
}

/**
 * Props para el componente GuiaSeccion.
 */
export interface GuiaSeccionProps {
  /** Título principal de la sección (ej: "Inicio de Sesión"). */
  titulo: string;
  /** Subtítulo o descripción breve de la sección. */
  subtitulo: string;
  /** Carpeta dentro de `imagenesayuda/` donde están las imágenes. */
  carpetaImagenes: string;
  /** Array de pasos ordenados. */
  pasos: PasoGuia[];
  /** Ruta para volver al índice del manual. */
  rutaVolver?: string;
}

/**
 * Componente reutilizable para renderizar una guía paso a paso del manual.
 *
 * Muestra un índice lateral con los pasos, y el contenido del paso activo
 * con imagen, título, descripción y nota opcional.
 * Las imágenes se cargan desde `imagenesayuda/{carpetaImagenes}/{imagen}.png`.
 */
export const GuiaSeccion = ({
  titulo,
  subtitulo,
  carpetaImagenes,
  pasos,
  rutaVolver = "/ayuda",
}: GuiaSeccionProps) => {
  const [pasoActivo, setPasoActivo] = useState(0);
  const paso = pasos[pasoActivo];

  if (!paso) return null;

  return (
    <div className="guia-seccion-contenedor">
      <Link to={rutaVolver} className="guia-seccion-volver">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver al manual
      </Link>

      <header className="guia-seccion-encabezado">
        <h1 className="guia-seccion-titulo">{titulo}</h1>
        <p className="guia-seccion-subtitulo">{subtitulo}</p>
      </header>

      <div className="guia-seccion-layout">
        {/* Índice lateral de pasos */}
        <nav className="guia-seccion-indice" aria-label="Índice de pasos">
          <p className="guia-seccion-indice-titulo">Pasos</p>
          <ol className="guia-seccion-indice-lista">
            {pasos.map((p, idx) => (
              <li key={p.numero}>
                <button
                  className={`guia-seccion-indice-item ${idx === pasoActivo ? "activo" : ""}`}
                  onClick={() => setPasoActivo(idx)}
                  aria-current={idx === pasoActivo ? "step" : undefined}
                >
                  <span className="guia-seccion-indice-num">{p.numero}</span>
                  <span className="guia-seccion-indice-texto">{p.titulo}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Contenido del paso activo */}
        <main className="guia-seccion-contenido">
          <div className="guia-seccion-paso-indicador">
            Paso {paso.numero} de {pasos.length}
          </div>

          <h2 className="guia-seccion-paso-titulo">{paso.titulo}</h2>
          <p className="guia-seccion-paso-descripcion">{paso.descripcion}</p>

          <figure className="guia-seccion-paso-figura">
            <div className="guia-seccion-paso-imagen-wrapper">
              <img
                src={`/imagenesayuda/${carpetaImagenes}/${paso.imagen}.png`}
                alt={paso.titulo}
                className="guia-seccion-paso-imagen"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = "flex";
                }}
              />
              <div className="guia-seccion-placeholder" style={{ display: "none" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>{paso.imagen}.png</span>
              </div>
            </div>
            {paso.nota && (
              <figcaption className="guia-seccion-paso-nota">{paso.nota}</figcaption>
            )}
          </figure>

          {/* Navegación entre pasos */}
          <div className="guia-seccion-navegacion">
            {pasoActivo > 0 && (
              <button
                className="guia-seccion-nav-btn"
                onClick={() => setPasoActivo(pasoActivo - 1)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Anterior
              </button>
            )}
            {pasoActivo < pasos.length - 1 ? (
              <button
                className="guia-seccion-nav-btn guia-seccion-nav-btn-siguiente"
                onClick={() => setPasoActivo(pasoActivo + 1)}
              >
                Siguiente
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <span className="guia-seccion-completado">✓ Guía completada</span>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
