import { Link } from "react-router-dom";
import "./ManualAyuda.css";

/**
 * Ícono SVG inline para cada categoría del manual.
 */
const iconos: Record<string, JSX.Element> = {
  login: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 7v2M12 15v2M7 12h2M15 12h2" />
    </svg>
  ),
  panel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  asistencia: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  inscripciones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  caja: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 12h.01" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  alumnos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  planes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  horarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  flyers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  ajustes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

/**
 * Página principal del Manual de Ayuda.
 *
 * Muestra las categorías disponibles del manual en formato de tarjetas con íconos.
 * Cada categoría enlaza a su respectiva guía paso a paso.
 * Las categorías se habilitan a medida que se completan las imágenes.
 */
export const ManualAyudaPage = () => {
  const categorias = [
    {
      id: "login",
      titulo: "Inicio de Sesión",
      descripcion: "Cómo acceder al sistema y configurar tu cuenta.",
      ruta: "/ayuda/login",
      disponible: true,
    },
    {
      id: "panel",
      titulo: "Panel Principal",
      descripcion: "Resumen de métricas, inscripciones y clases del día.",
      ruta: "/ayuda/panel",
      disponible: true,
    },
    {
      id: "asistencia",
      titulo: "Asistencia",
      descripcion: "Cómo registrar y consultar la asistencia de clases.",
      ruta: "/ayuda/asistencia",
      disponible: true,
    },
    {
      id: "inscripciones",
      titulo: "Inscripciones",
      descripcion: "Cómo inscribir alumnos y gestionar sus planes.",
      ruta: "/ayuda/inscripciones",
      disponible: true,
    },
    {
      id: "caja",
      titulo: "Arqueo de Caja",
      descripcion: "Cómo abrir, gestionar y cerrar la caja diaria.",
      ruta: "/ayuda/caja",
      disponible: false,
    },
    {
      id: "alumnos",
      titulo: "Alumnos y Profesores",
      descripcion: "Cómo dar de alta, modificar y gestionar alumnos y profesores.",
      ruta: "/ayuda/alumnos",
      disponible: true,
    },
    {
      id: "planes",
      titulo: "Planes de Pago",
      descripcion: "Cómo crear y gestionar los planes de suscripción.",
      ruta: "/ayuda/planes",
      disponible: true,
    },
    {
      id: "horarios",
      titulo: "Horarios",
      descripcion: "Cómo configurar los horarios de clase semanales.",
      ruta: "/ayuda/horarios",
      disponible: true,
    },
    {
      id: "flyers",
      titulo: "Flyers y Novedades",
      descripcion: "Cómo crear y publicar flyers promocionales.",
      ruta: "/ayuda/flyers",
      disponible: true,
    },
    {
      id: "ajustes",
      titulo: "Ajustes",
      descripcion: "Niveles, géneros musicales, categorías y tipos de cuenta.",
      ruta: "/ayuda/ajustes",
      disponible: true,
    },
  ];

  return (
    <div className="manual-ayuda-contenedor">
      <header className="manual-ayuda-encabezado">
        <div className="manual-ayuda-encabezado-interior">
          <h1 className="manual-ayuda-titulo">Manual de Ayuda</h1>
          <p className="manual-ayuda-subtitulo">
            Guía visual paso a paso para usar todas las funciones del sistema.
          </p>
        </div>
      </header>

      <section className="manual-ayuda-categorias" aria-label="Categorías del manual">
        {categorias.map((cat) => (
          <article
            key={cat.id}
            className={`manual-ayuda-tarjeta ${!cat.disponible ? "manual-ayuda-tarjeta-deshabilitada" : ""}`}
          >
            {cat.disponible ? (
              <Link to={cat.ruta} className="manual-ayuda-tarjeta-link" aria-label={`Ver sección ${cat.titulo}`}>
                <div className="manual-ayuda-tarjeta-icono">
                  {iconos[cat.id]}
                </div>
                <h2 className="manual-ayuda-tarjeta-titulo">{cat.titulo}</h2>
                <p className="manual-ayuda-tarjeta-descripcion">{cat.descripcion}</p>
                <span className="manual-ayuda-tarjeta-accion">
                  Ver guía
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ) : (
              <>
                <div className="manual-ayuda-tarjeta-icono manual-ayuda-tarjeta-icono-deshabilitado">
                  {iconos[cat.id]}
                </div>
                <h2 className="manual-ayuda-tarjeta-titulo">{cat.titulo}</h2>
                <p className="manual-ayuda-tarjeta-descripcion">{cat.descripcion}</p>
                <span className="manual-ayuda-badge">Próximamente</span>
              </>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};
