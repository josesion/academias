import "./inicio.css";
import "./inicio.scroll.css";
import { usePlanesPublicos } from "../../../hooks/publico/usePlanesPublicos";
import { ModalRegistroGratuito } from "../../../componentes/ModalRegistroGratuito/ModalRegistroGratuito";
import {
  FaInstagram,
  FaWhatsapp,
  FaUserGraduate,
  FaCalendarDays,
  FaCashRegister,
  FaClipboardCheck,
  FaChartLine,
  FaBell,
} from "react-icons/fa6";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type MouseEvent as EventoMouse,
  type TouchEvent as EventoToque,
} from "react";

/* ==========================================================================
   👇👇👇  IMÁGENES Y VIDEO: ACÁ PONÉS LOS TUYOS  👇👇👇
   ==========================================================================

   Ahora todo usa imágenes de relleno (placehold.co) y un video de ejemplo.
   Para poner las tuyas:

   OPCIÓN A (la más simple): guardá los archivos en  public/landing/
       y usá la ruta que empieza con "/":
           src: "/landing/hero.webp"

   OPCIÓN B: guardalos en src/assets/landing/, importalos arriba del todo:
           import heroImg from "../../../assets/landing/hero.webp";
       y usá:
           src: heroImg

   Recomendado: .webp para imágenes (proporción 16:10, ej. 1600×1000)
                .mp4 o .webm para el video (ideal menos de 3 MB, 15 a 30 s)
   ========================================================================== */

//  1) CAPTURA DEL HERO (pantalla principal, al lado del título)
const IMAGEN_HERO = {
  src: "/hero.png",
  alt: "Panel de ELPHIS con alumnos, clases y caja",
};

//  2) VIDEO DE LA PANTALLA "BENEFICIOS"
const VIDEO_DEMO = {
  src: "/presentacion.mp4",
  // Imagen que se ve mientras carga (y si el usuario tiene "reducir movimiento")
  poster: "/hero.png",
  titulo: "Demostración de ELPHIS en funcionamiento",
};

//  3) CAPTURAS DE LA SECCIÓN "FUNCIONES" están más abajo, en FUNCIONES,
//       en el campo `imagen` de cada una (una captura por función).

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
    Icono: FaUserGraduate,
    titulo: "Gestión de Alumnos",
    texto: "Registrá alumnos, inscripciones, vencimientos y clases restantes.",
    imagen: "/gestion-alumnos.png",
  },
  {
    Icono: FaCalendarDays,
    titulo: "Horarios Inteligentes",
    texto: "Organizá clases, profesores y salas desde un calendario moderno.",
    imagen: "/horarios-inteligente.png",
  },
  {
    Icono: FaCashRegister,
    titulo: "Caja Diaria",
    texto: "Control completo de ingresos, egresos y arqueos de caja.",
    imagen: "/caja-diaria.png",
  },
  {
    Icono: FaClipboardCheck,
    titulo: "Asistencias",
    texto: "Registro rápido de asistencia con estadísticas automáticas.",
    imagen: "/asistencia.png",
  },
  {
    Icono: FaChartLine,
    titulo: "Reportes",
    texto: "Visualizá el rendimiento de tu negocio en tiempo real.",
    imagen: "/reportes.png",
  },
  {
    Icono: FaBell,
    titulo: "Notificaciones",
    texto: "Comunicaciones rápidas con alumnos y profesores.",
    imagen: "/notificaciones.png",
  },
];

const BENEFICIOS = [
  "Eliminá planillas de Excel.",
  "Controlá tu academia o gym desde cualquier dispositivo.",
  "Ahorrá tiempo en tareas administrativas.",
  "Información centralizada.",
  "Plataforma moderna y segura.",
  "Actualizaciones constantes.",
];

/* ==========================================================================
   AUXILIARES
   ========================================================================== */

// Orden de entrada de cada elemento dentro de su pantalla (escalonado)
const d = (n: number) => ({ "--i": n }) as CSSProperties;

// Escalonado de las cards de planes. El tope evita que, con 4 planes, la
// última tarde ~1.5s en entrar (`--i` sin tope daba 0.45s + 5×80ms).
const dPlan = (i: number) => d(2 + Math.min(i, 3));

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

// Marco tipo ventana de navegador. Adentro va una imagen o un video.
const MarcoApp = ({ children }: { children: ReactNode }) => (
  <div className="marco_app">
    <div className="marco_app_barra" aria-hidden="true">
      <span className="dashboard_dot rojo"></span>
      <span className="dashboard_dot amarillo"></span>
      <span className="dashboard_dot verde"></span>
    </div>
    <div className="marco_app_pantalla">{children}</div>
  </div>
);

// Video en loop: solo se reproduce mientras su pantalla está activa.
// Con "reducir movimiento" no se autorreproduce: muestra el poster y controles.
const VideoDemo = ({ activo }: { activo: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [reducido] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const video = ref.current;
    if (!video || reducido) return;
    if (activo) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [activo, reducido]);

  return (
    <video
      ref={ref}
      className="marco_app_img"
      src={VIDEO_DEMO.src}
      poster={VIDEO_DEMO.poster}
      aria-label={VIDEO_DEMO.titulo}
      muted
      loop
      playsInline
      preload="metadata"
      controls={reducido}
    />
  );
};

/* ==========================================================================
   COMPONENTE
   ========================================================================== */

export const Inicio = () => {
  const { planes, carga, error } = usePlanesPublicos();
  const [indice, setIndice] = useState(indiceDesdeHash);
  // Función seleccionada en la pantalla "Funciones"
  const [funcionActiva, setFuncionActiva] = useState(0);
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
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

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
  const beneficiosActivo = indice === 2;

  // El plan más caro es el destacado. No se usa el índice porque con datos del
  // server la posición del listado ya no significa nada.
  const idMasCaro = planes.reduce(
    (mayor, plan) => (plan.precio > mayor.precio ? plan : mayor),
    planes[0],
  )?.id_plan;

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
                Para academias de baile, gym, profesores y entrenadores
              </span>

              <div className="contacto_inicio hero_contacto anim" style={d(1)}>
                <a
                  href="https://www.instagram.com/siontech.software"
                  className="contacto_item contacto_item_instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de Siontech Software"
                >
                  <FaInstagram className="contacto_icono" aria-hidden="true" />
                  <span>@siontech.software</span>
                </a>
                <a
                  href="https://wa.me/5493875450396"
                  className="contacto_item contacto_item_whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp 3875450396"
                >
                  <FaWhatsapp className="contacto_icono" aria-hidden="true" />
                  <span>3875450396</span>
                </a>
              </div>

              <h1 className="hero_titulo">
                <span className="linea">
                  <span className="linea_texto" style={d(2)}>
                    Gestioná tu academia o gym
                  </span>
                </span>
                <span className="linea">
                  <span className="linea_texto" style={d(3)}>
                    desde un solo lugar.
                  </span>
                </span>
              </h1>

              <p className="hero_descripcion anim" style={d(4)}>
                ELPHIS reúne alumnos, profesores, horarios, caja, asistencias e
                inscripciones en un solo sistema, para una academia, un gym o
                tus clases particulares.
              </p>

              <div className="hero_botones anim" style={d(5)}>
                <a href="/login" className="boton_principal">
                  Iniciar Sesión
                </a>

                <button
                  type="button"
                  className="boton_secundario"
                  onClick={() => setMostrarRegistro(true)}
                >
                  Comenzar
                </button>
              </div>

              <div className="hero_estadisticas anim" style={d(6)}>
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

            {/* 👇 CAPTURA DEL HERO: se cambia en IMAGEN_HERO (arriba del archivo) */}
            <div className="hero_dashboard anim anim_lateral" style={d(4)}>
              <MarcoApp>
                <img
                  className="marco_app_img"
                  src={IMAGEN_HERO.src}
                  alt={IMAGEN_HERO.alt}
                  fetchPriority="high"
                  decoding="async"
                />
              </MarcoApp>

              <div className="hero_flotante hero_flotante_1">
                <span>Alumnos</span>
                <strong>
                  <Contador hasta={245} activo={heroActivo} />
                </strong>
              </div>

              <div className="hero_flotante hero_flotante_2">
                <span>Ingresos</span>
                <strong>
                  <Contador hasta={248500} activo={heroActivo} prefijo="$" />
                </strong>
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
              descripcion="Para academias de baile, gym y profesores."
            />

            <div className="funciones_visor">
              <div className="funciones_lista anim" style={d(3)}>
                {FUNCIONES.map((f, i) => (
                  <button
                    key={f.titulo}
                    type="button"
                    className={`funcion_item${i === funcionActiva ? " activa" : ""}`}
                    aria-pressed={i === funcionActiva}
                    onClick={() => setFuncionActiva(i)}
                    onMouseEnter={() => setFuncionActiva(i)}
                  >
                    <span className="funcion_icono">
                      <f.Icono aria-hidden="true" />
                    </span>
                    <span className="funcion_item_texto">
                      <strong>{f.titulo}</strong>
                      <span className="funcion_item_desc">
                        <span>{f.texto}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {/* 👇 CAPTURAS DE FUNCIONES: se cambian en FUNCIONES → `imagen` */}
              <div className="funciones_visor_marco anim" style={d(4)}>
                <MarcoApp>
                  {FUNCIONES.map((f, i) => (
                    <img
                      key={f.titulo}
                      className={`marco_app_img visor_img${i === funcionActiva ? " activa" : ""}`}
                      src={f.imagen}
                      alt={i === funcionActiva ? `Pantalla de ${f.titulo}` : ""}
                      aria-hidden={i !== funcionActiva}
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </MarcoApp>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3 · BENEFICIOS (+ VIDEO) ================= */}

      <section
        id="beneficios"
        ref={ponerRef(2)}
        className={`${clasePanel(2)} pantalla_beneficios`}
        aria-hidden={indice !== 2}
      >
        <div className="pantalla_contenido">
          <div className="beneficios">
            <TituloSeccion
              etiqueta="¿POR QUÉ ELPHIS?"
              titulo="Trabajá menos y controlá más."
            />

            <div className="beneficios_layout">
              {/* 👇 VIDEO: se cambia en VIDEO_DEMO (arriba del archivo) */}
              <div className="beneficios_video">
                <MarcoApp>
                  <VideoDemo activo={beneficiosActivo} />
                </MarcoApp>
              </div>

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
              titulo="Elegí el plan para tu academia o gym."
            />

            {carga || error ? (
              <p className="planes_mensaje anim" style={d(2)}>
                {error ?? "Cargando planes…"}
              </p>
            ) : (
              <div className="planes_grid">
                {planes.map((plan, i) => {
                  const destacado = plan.id_plan === idMasCaro;
                  const idTitulo = `plan_titulo_${plan.id_plan}`;

                  return (
                    <article
                      key={plan.id_plan}
                      className={`plan_card anim${destacado ? " destacado" : ""}`}
                      style={dPlan(i)}
                      aria-labelledby={idTitulo}
                    >
                      {destacado && (
                        <span className="plan_etiqueta">Más completo</span>
                      )}

                      <header className="plan_cabecera">
                        <span className="plan_tipo">{plan.tipo}</span>
                        <h3 id={idTitulo}>{plan.descripcion}</h3>
                      </header>

                      <div className="plan_precio">
                        <span className="plan_precio_moneda">$</span>
                        <span className="plan_precio_monto">
                          {plan.precio.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <ul className="plan_lista">
                        {plan.caracteristicas.map((caracteristica, j) => (
                          <li
                            key={`${caracteristica.clave}-${j}`}
                            className="plan_caract"
                          >
                            <span className="plan_caract_clave">
                              {caracteristica.clave}
                            </span>
                            <span className="plan_caract_valor">
                              {caracteristica.valor}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className={`plan_boton${destacado ? " plan_boton_destacado" : ""}`}
                        onClick={() => setMostrarRegistro(true)}
                        aria-label={`Comenzar con el plan ${plan.descripcion}`}
                      >
                        Comenzar
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
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
                  Comenzá a digitalizar tu academia o gym.
                </span>
              </span>
            </h2>

            <div className="contacto_inicio anim" style={d(1)}>
              <a
                href="https://www.instagram.com/siontech.software"
                className="contacto_item contacto_item_instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Siontech Software"
              >
                <FaInstagram className="contacto_icono" aria-hidden="true" />
                <span>@siontech.software</span>
              </a>
              <a
                href="https://wa.me/5493875450396"
                className="contacto_item contacto_item_whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp 3875450396"
              >
                <FaWhatsapp className="contacto_icono" aria-hidden="true" />
                <span>3875450396</span>
              </a>
            </div>

            <p className="anim" style={d(2)}>
              Probá ELPHIS y descubrí una forma más simple de administrar
              alumnos, clases y finanzas.
            </p>

            <button
              type="button"
              className="boton_principal anim"
              style={d(3)}
              onClick={() => setMostrarRegistro(true)}
            >
              Comenzar ahora
            </button>
          </div>

          <footer className="footer anim" style={d(4)}>
            <h3>ELPHIS</h3>

            <p>Sistema integral para academias, gym y profesores.</p>

            <div className="footer_contacto">
              <a
                href="https://www.instagram.com/siontech.software"
                className="contacto_item contacto_item_instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Siontech Software"
              >
                <FaInstagram className="contacto_icono" aria-hidden="true" />
                <span>@siontech.software</span>
              </a>
              <a
                href="https://wa.me/5493875450396"
                className="contacto_item contacto_item_whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp 3875450396"
              >
                <FaWhatsapp className="contacto_icono" aria-hidden="true" />
                <span>3875450396</span>
              </a>
            </div>

            <small>© 2026 ELPHIS · Todos los derechos reservados.</small>
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
      <ModalRegistroGratuito
        abierto={mostrarRegistro}
        onCerrar={() => setMostrarRegistro(false)}
      />
    </div>
  );
};
