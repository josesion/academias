import "./inicio.css";
import "./inicio.scroll.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as EventoMouse,
  type TouchEvent as EventoToque,
} from "react";

/* ==========================================================================
   CONFIGURACIÓN
   ========================================================================== */

// Las 5 pantallas. El id se usa para el hash de la URL (#planes, etc.)
const SECCIONES = [
  { id: "inicio", etiqueta: "Inicio" },
  { id: "funciones", etiqueta: "Funciones" },
  { id: "beneficios", etiqueta: "Beneficios" },
  { id: "planes", etiqueta: "Planes" },
  { id: "comenzar", etiqueta: "Comenzar" },
];

// Mientras dura este tiempo se ignora el input tras cambiar de pantalla.
// Debe ser parecido a --duracion-corte del CSS (0.9s).
const BLOQUEO_MS = 950;

// Si entre dos eventos de rueda pasa menos que esto, es el mismo gesto
// (inercia del trackpad) y no cuenta como un nuevo cambio de pantalla.
const PAUSA_GESTO_MS = 110;

const FUNCIONES = [
  {
    icono: "👨‍🎓",
    titulo: "Gestión de Alumnos",
    texto: "Registrá alumnos, inscripciones, vencimientos y clases restantes.",
  },
  {
    icono: "📅",
    titulo: "Horarios Inteligentes",
    texto: "Organizá cursos, profesores y aulas desde un calendario moderno.",
  },
  {
    icono: "💰",
    titulo: "Caja Diaria",
    texto: "Control completo de ingresos, egresos y arqueos de caja.",
  },
  {
    icono: "✅",
    titulo: "Asistencias",
    texto: "Registro rápido de asistencia con estadísticas automáticas.",
  },
  {
    icono: "📊",
    titulo: "Reportes",
    texto: "Visualizá el rendimiento de tu academia en tiempo real.",
  },
  {
    icono: "🔔",
    titulo: "Notificaciones",
    texto: "Comunicaciones rápidas con alumnos y profesores.",
  },
];

const BENEFICIOS = [
  "Eliminá planillas de Excel.",
  "Controlá toda tu academia desde cualquier dispositivo.",
  "Ahorrá tiempo en tareas administrativas.",
  "Información centralizada.",
  "Plataforma moderna y segura.",
  "Actualizaciones constantes.",
];

const PLAN_MENSUAL = [
  "Gestión de alumnos",
  "Caja",
  "Asistencias",
  "Horarios",
  "Reportes",
  "Actualizaciones",
];

const PLAN_LANZAMIENTO = [
  "Todas las funciones",
  "Soporte prioritario",
  "Actualizaciones",
  "Sin límite de crecimiento",
];

/* ==========================================================================
   AUXILIARES
   ========================================================================== */

// Orden de entrada de cada elemento dentro de su pantalla (escalonado)
const d = (n: number) => ({ "--i": n }) as CSSProperties;

const indiceDesdeHash = () => {
  if (typeof window === "undefined") return 0;
  const i = SECCIONES.findIndex((s) => s.id === window.location.hash.slice(1));
  return i >= 0 ? i : 0;
};

// Número que sube de 0 al valor final cuando la pantalla se activa
const Contador = ({
  hasta,
  activo,
  prefijo = "",
  sufijo = "",
}: {
  hasta: number;
  activo: boolean;
  prefijo?: string;
  sufijo?: string;
}) => {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValor(hasta);
      return;
    }

    // Al salir de la pantalla, se reinicia cuando ya no se ve
    if (!activo) {
      const t = window.setTimeout(() => setValor(0), 1000);
      return () => window.clearTimeout(t);
    }

    let raf = 0;
    const inicio = performance.now() + 700; // espera a que termine el corte
    const duracion = 1400;

    const paso = (t: number) => {
      const p = Math.min(Math.max((t - inicio) / duracion, 0), 1);
      setValor(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [activo, hasta]);

  return (
    <>
      {prefijo}
      {valor.toLocaleString("es-AR")}
      {sufijo}
    </>
  );
};

const TituloSeccion = ({
  etiqueta,
  titulo,
  descripcion,
}: {
  etiqueta: string;
  titulo: string;
  descripcion?: string;
}) => (
  <div className="titulo_seccion">
    <span className="anim" style={d(0)}>
      {etiqueta}
    </span>
    <h2>
      <span className="linea">
        <span className="linea_texto" style={d(1)}>
          {titulo}
        </span>
      </span>
    </h2>
    {descripcion && (
      <p className="anim" style={d(2)}>
        {descripcion}
      </p>
    )}
  </div>
);

/* ==========================================================================
   COMPONENTE
   ========================================================================== */

export const Inicio = () => {
  const [indice, setIndice] = useState(indiceDesdeHash);
  // Cada cambio monta una línea de luz que viaja con el corte
  const [corte, setCorte] = useState<{ n: number; dir: "subir" | "bajar" }>({
    n: 0,
    dir: "subir",
  });

  const raizRef = useRef<HTMLDivElement>(null);
  const panelesRef = useRef<(HTMLElement | null)[]>([]);
  const bloqueadoHasta = useRef(0);
  const ultimoWheel = useRef(0);
  const toque = useRef<{
    y: number;
    alInicio: boolean;
    alFinal: boolean;
  } | null>(null);

  const ponerRef = (i: number) => (el: HTMLElement | null) => {
    panelesRef.current[i] = el;
  };

  const clasePanel = (i: number) =>
    `pantalla ${
      i === indice
        ? "pantalla_activa"
        : i < indice
          ? "pantalla_anterior"
          : "pantalla_siguiente"
    }`;

  // ¿La pantalla activa todavía tiene contenido para scrollear en esa dirección?
  // (pasa en celulares o ventanas bajas, donde una pantalla no entra completa)
  const puedeScrollear = useCallback(
    (direccion: 1 | -1) => {
      const panel = panelesRef.current[indice];
      if (!panel) return false;
      return direccion > 0
        ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 1
        : panel.scrollTop > 0;
    },
    [indice],
  );

  const irA = useCallback(
    (destino: number) => {
      if (destino < 0 || destino >= SECCIONES.length || destino === indice) {
        return;
      }
      const ahora = performance.now();
      if (ahora < bloqueadoHasta.current) return;
      bloqueadoHasta.current = ahora + BLOQUEO_MS;

      setCorte((c) => ({
        n: c.n + 1,
        dir: destino > indice ? "subir" : "bajar",
      }));
      setIndice(destino);
    },
    [indice],
  );

  // Links internos (#planes): van a la pantalla en vez de hacer scroll nativo
  const alClickSeccion =
    (id: string) => (e: EventoMouse<HTMLAnchorElement>) => {
      e.preventDefault();
      irA(SECCIONES.findIndex((s) => s.id === id));
    };

  // Mantiene el hash de la URL sincronizado (sin ensuciar el historial)
  useEffect(() => {
    const url =
      indice === 0
        ? window.location.pathname + window.location.search
        : `#${SECCIONES[indice].id}`;
    window.history.replaceState(window.history.state, "", url);
  }, [indice]);

  // Si alguien cambia el hash a mano o llega desde otro link
  useEffect(() => {
    const alCambiarHash = () => setIndice(indiceDesdeHash());
    window.addEventListener("hashchange", alCambiarHash);
    return () => window.removeEventListener("hashchange", alCambiarHash);
  }, []);

  // Las pantallas que quedaron atrás vuelven arriba (cuando ya no se ven)
  useEffect(() => {
    const t = window.setTimeout(() => {
      panelesRef.current.forEach((panel, i) => {
        if (panel && i !== indice) panel.scrollTop = 0;
      });
    }, BLOQUEO_MS);
    return () => window.clearTimeout(t);
  }, [indice]);

  // Rueda del mouse / trackpad
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;

    const alRodar = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < 4) return; // ctrl+rueda = zoom

      const ahora = performance.now();
      const pausa = ahora - ultimoWheel.current;
      ultimoWheel.current = ahora;

      const direccion = e.deltaY > 0 ? 1 : -1;

      // Todavía hay contenido dentro de la pantalla: scroll nativo
      if (puedeScrollear(direccion)) return;

      // Primera/última pantalla: dejamos que la página se comporte normal
      const destino = indice + direccion;
      if (destino < 0 || destino >= SECCIONES.length) return;

      e.preventDefault();
      if (pausa < PAUSA_GESTO_MS) return; // sigue la inercia del mismo gesto
      irA(destino);
    };

    raiz.addEventListener("wheel", alRodar, { passive: false });
    return () => raiz.removeEventListener("wheel", alRodar);
  }, [indice, irA, puedeScrollear]);

  // Teclado
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      const avanza = e.key === "ArrowDown" || e.key === "PageDown";
      const retrocede = e.key === "ArrowUp" || e.key === "PageUp";

      if (avanza || retrocede) {
        e.preventDefault();
        const direccion = avanza ? 1 : -1;
        if (puedeScrollear(direccion)) {
          panelesRef.current[indice]?.scrollBy({
            top: direccion * window.innerHeight * 0.6,
            behavior: "smooth",
          });
        } else {
          irA(indice + direccion);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        irA(0);
      } else if (e.key === "End") {
        e.preventDefault();
        irA(SECCIONES.length - 1);
      }
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [indice, irA, puedeScrollear]);

  // Táctil
  const alTocar = (e: EventoToque) => {
    toque.current = {
      y: e.touches[0].clientY,
      alInicio: !puedeScrollear(-1),
      alFinal: !puedeScrollear(1),
    };
  };

  const alSoltar = (e: EventoToque) => {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio) return;

    const delta = inicio.y - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;

    const direccion = delta > 0 ? 1 : -1;
    // Si el gesto se usó para scrollear dentro de la pantalla, no cambia
    if (direccion > 0 && !inicio.alFinal) return;
    if (direccion < 0 && !inicio.alInicio) return;

    irA(indice + direccion);
  };

  const heroActivo = indice === 0;

  return (
    <div
      className="inicio"
      ref={raizRef}
      onTouchStart={alTocar}
      onTouchEnd={alSoltar}
    >
      {/* ================= 1 · HERO ================= */}

      <section
        id="inicio"
        ref={ponerRef(0)}
        className={clasePanel(0)}
        aria-hidden={indice !== 0}
      >
        <div className="pantalla_contenido">
          <div className="hero">
            <div className="hero_glow hero_glow_1"></div>
            <div className="hero_glow hero_glow_2"></div>

            <div className="hero_contenido">
              <span className="hero_badge anim" style={d(0)}>
                Plataforma Integral para Academias de Danza
              </span>

              <h1 className="hero_titulo">
                <span className="linea">
                  <span className="linea_texto" style={d(1)}>
                    Gestioná tu academia
                  </span>
                </span>
                <span className="linea">
                  <span className="linea_texto" style={d(2)}>
                    desde un solo lugar.
                  </span>
                </span>
              </h1>

              <p className="hero_descripcion anim" style={d(3)}>
                ELPIS reúne alumnos, profesores, horarios, caja, asistencias,
                inscripciones, reportes y mucho más en una plataforma moderna,
                rápida y fácil de utilizar.
              </p>

              <div className="hero_botones anim" style={d(4)}>
                <a href="/login" className="boton_principal">
                  Iniciar Sesión
                </a>

                <a
                  href="#planes"
                  className="boton_secundario"
                  onClick={alClickSeccion("planes")}
                >
                  Ver planes
                </a>
              </div>

              <div className="hero_estadisticas anim" style={d(5)}>
                <div className="estadistica">
                  <strong>100%</strong>
                  <span>Administración Digital</span>
                </div>

                <div className="estadistica">
                  <strong>24/7</strong>
                  <span>Acceso Online</span>
                </div>

                <div className="estadistica">
                  <strong>∞</strong>
                  <span>Escalable</span>
                </div>
              </div>
            </div>

            <div className="hero_dashboard anim anim_lateral" style={d(3)}>
              <div className="dashboard_card">
                <div className="dashboard_header">
                  <span className="dashboard_dot rojo"></span>
                  <span className="dashboard_dot amarillo"></span>
                  <span className="dashboard_dot verde"></span>
                </div>

                <div className="dashboard_metricas">
                  <div className="dashboard_item">
                    <span>Alumnos</span>
                    <strong>
                      <Contador hasta={245} activo={heroActivo} />
                    </strong>
                  </div>

                  <div className="dashboard_item">
                    <span>Clases Hoy</span>
                    <strong>
                      <Contador hasta={18} activo={heroActivo} />
                    </strong>
                  </div>

                  <div className="dashboard_item">
                    <span>Ingresos</span>
                    <strong>
                      <Contador
                        hasta={248500}
                        activo={heroActivo}
                        prefijo="$"
                      />
                    </strong>
                  </div>

                  <div className="dashboard_item">
                    <span>Asistencias</span>
                    <strong>
                      <Contador hasta={92} activo={heroActivo} sufijo="%" />
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2 · FUNCIONALIDADES ================= */}

      <section
        id="funciones"
        ref={ponerRef(1)}
        className={clasePanel(1)}
        aria-hidden={indice !== 1}
      >
        <div className="pantalla_contenido">
          <div className="funciones">
            <TituloSeccion
              etiqueta="TODO EN UN SOLO SISTEMA"
              titulo="Funciones principales"
              descripcion="Diseñado específicamente para academias de danza."
            />

            <div className="funciones_grid">
              {FUNCIONES.map((f, i) => (
                <article
                  className="funcion_card anim"
                  style={d(3 + i)}
                  key={f.titulo}
                >
                  <div className="funcion_icono">{f.icono}</div>
                  <h3>{f.titulo}</h3>
                  <p>{f.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 · BENEFICIOS ================= */}

      <section
        id="beneficios"
        ref={ponerRef(2)}
        className={`${clasePanel(2)} pantalla_beneficios`}
        aria-hidden={indice !== 2}
      >
        <div className="pantalla_contenido">
          <div className="beneficios">
            <TituloSeccion
              etiqueta="¿POR QUÉ ELPIS?"
              titulo="Trabajá menos y controlá más."
            />

            <div className="beneficios_grid">
              {BENEFICIOS.map((texto, i) => (
                <div
                  className={`beneficio anim ${
                    i % 2 === 0 ? "anim_izq" : "anim_der"
                  }`}
                  style={d(2 + Math.floor(i / 2))}
                  key={texto}
                >
                  ✔ {texto}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 · PLANES ================= */}

      <section
        id="planes"
        ref={ponerRef(3)}
        className={clasePanel(3)}
        aria-hidden={indice !== 3}
      >
        <div className="pantalla_contenido">
          <div className="planes">
            <TituloSeccion
              etiqueta="PLANES"
              titulo="Elegí el plan ideal para tu academia."
            />

            <div className="planes_grid">
              <article className="plan_card anim" style={d(2)}>
                <span className="plan_tipo">Profesional</span>

                <h3>Plan Mensual</h3>

                <div className="plan_precio">Consultar</div>

                <ul>
                  {PLAN_MENSUAL.map((t) => (
                    <li key={t}>✔ {t}</li>
                  ))}
                </ul>

                <a href="/login" className="plan_boton">
                  Comenzar
                </a>
              </article>

              <article className="plan_card destacado anim" style={d(3)}>
                <span className="plan_oferta">50% OFF · Primeros 3 meses</span>

                <h3>Lanzamiento ELPIS</h3>

                <div className="plan_precio">Promoción Especial</div>

                <ul>
                  {PLAN_LANZAMIENTO.map((t) => (
                    <li key={t}>✔ {t}</li>
                  ))}
                </ul>

                <a href="/login" className="plan_boton">
                  Quiero la promoción
                </a>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5 · CTA + FOOTER ================= */}

      <section
        id="comenzar"
        ref={ponerRef(4)}
        className={clasePanel(4)}
        aria-hidden={indice !== 4}
      >
        <div className="pantalla_contenido">
          <div className="cta">
            <h2>
              <span className="linea">
                <span className="linea_texto" style={d(0)}>
                  Comenzá hoy mismo a digitalizar tu academia.
                </span>
              </span>
            </h2>

            <p className="anim" style={d(2)}>
              Probá ELPIS y descubrí una forma más simple de administrar
              alumnos, clases y finanzas.
            </p>

            <a href="/login" className="boton_principal anim" style={d(3)}>
              Comenzar ahora
            </a>
          </div>

          <footer className="footer anim" style={d(4)}>
            <h3>ELPIS</h3>

            <p>Sistema integral para academias de danza.</p>

            <small>© 2026 ELPIS · Todos los derechos reservados.</small>
          </footer>
        </div>
      </section>

      {/* ================= ELEMENTOS FIJOS ================= */}

      {corte.n > 0 && (
        <div
          key={corte.n}
          className={`inicio_corte corte_${corte.dir}`}
          aria-hidden="true"
        />
      )}

      <div
        className={`inicio_pista ${heroActivo ? "" : "pista_oculta"}`}
        aria-hidden="true"
      >
        <span>Deslizá</span>
        <span className="pista_linea"></span>
      </div>

      <nav className="inicio_nav" aria-label="Secciones">
        {SECCIONES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="inicio_nav_punto"
            aria-label={`Ir a ${s.etiqueta}`}
            aria-current={i === indice}
            onClick={() => irA(i)}
          >
            <span className="inicio_nav_etiqueta">{s.etiqueta}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
