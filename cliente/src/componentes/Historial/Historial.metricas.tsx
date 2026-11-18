import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import "./historial.metreicas.css";
import type { ResultHistorial } from "../../servicio/historial.fetch";
import {
  PlusCircle,
  Edit3,
  Trash2,
  RotateCcw,
  Unlock,
  Lock,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  LogIn,
  LogOut,
  Users,
  Building,
  BookOpen,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const capitalizarModulo = (modulo: string) =>
  modulo.charAt(0) + modulo.slice(1).toLowerCase();

const ICONO_MODULO: Record<string, LucideIcon> = {
  usuario: Users,
  escuela: Building,
  alumno: Users,
  profesor: User,
  plan: BookOpen,
  caja: Users,
  inscripcion: BookOpen,
  horario: BookOpen,
  configuracion: Settings,
  default: Settings,
};

const ESTILO_ACCION: Record<
  ResultHistorial["accion"],
  {
    color: "verde" | "rojo" | "azul" | "violeta" | "gris";
    etiqueta: string;
    icono: LucideIcon;
  }
> = {
  CREAR: { color: "verde", etiqueta: "Creó", icono: PlusCircle },
  MODIFICAR: { color: "azul", etiqueta: "Modificó", icono: Edit3 },
  ELIMINAR: { color: "rojo", etiqueta: "Eliminó", icono: Trash2 },
  RESTAURAR: { color: "violeta", etiqueta: "Restauró", icono: RotateCcw },
  ABRIR: { color: "verde", etiqueta: "Abrió", icono: Unlock },
  CERRAR: { color: "rojo", etiqueta: "Cerró", icono: Lock },
  INGRESO: { color: "verde", etiqueta: "Ingreso", icono: ArrowUpCircle },
  EGRESO: { color: "rojo", etiqueta: "Egreso", icono: ArrowDownCircle },
  ANULACION: { color: "rojo", etiqueta: "Anulacion", icono: XCircle },
  LOGIN: { color: "azul", etiqueta: "Inició sesión", icono: LogIn },
  LOGOUT: { color: "gris", etiqueta: "Cerró sesión", icono: LogOut },
  TRANSFERENCIA: { color: "azul", etiqueta: "Transferencia", icono: ArrowUpCircle },
  RETENCION: { color: "violeta", etiqueta: "Retención", icono: Lock },
  DEVOLUCION_RETENCION: { color: "verde", etiqueta: "Devolución", icono: Unlock },
  JUSTIFICACION_RETENCION: { color: "gris", etiqueta: "Justificación", icono: Edit3 },
};

const formatearFechaRelativa = (fecha: Date): string => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === 1) return "Mañana";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatearHora = (fecha: Date) =>
  new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatearFecha = (fecha: Date) =>
  new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// Agrupa el historial en bloques por dia
const agruparPorDia = (historial: ResultHistorial[]) => {
  const grupos: { fecha: string; items: ResultHistorial[] }[] = [];

  historial.forEach((item) => {
    const claveFecha = formatearFecha(item.fecha);
    const ultimoGrupo = grupos[grupos.length - 1];

    if (ultimoGrupo && ultimoGrupo.fecha === claveFecha) {
      ultimoGrupo.items.push(item);
    } else {
      grupos.push({ fecha: claveFecha, items: [item] });
    }
  });

  return grupos;
};

// Componente para renderizar el icono del modulo dinamico
const IconoModulo = ({ modulo, size }: { modulo: string; size: number }) => {
  const Icono = ICONO_MODULO[modulo.toLowerCase()] || ICONO_MODULO.default;
  return <Icono size={size} />;
};

/** Separación entre tarjetas de movimiento; igual al `gap` de `.historial_linea_tiempo`. */
const GAP_TARJETAS = 16;

interface PropsMetricasHistorial {
  historial: ResultHistorial[] | null;
}

export const MetricasHistorial = ({ historial }: PropsMetricasHistorial) => {
  const items = historial ?? [];

  // ---- Estado del carrusel ------------------------------------------------
  const pistaRef = useRef<HTMLDivElement>(null);
  const arrastre = useRef({ activo: false, x: 0, scroll: 0 });
  const [arrastrando, setArrastrando] = useState(false);
  const [bordes, setBordes] = useState({
    izq: false,
    der: false,
    ratio: 1,
    prog: 0,
  });

  /** Recalcula qué flechas mostrar y la posición de la barra de progreso. */
  const actualizarBordes = useCallback(() => {
    const el = pistaRef.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setBordes({
      izq: el.scrollLeft > 4,
      der: el.scrollLeft < max - 4,
      ratio:
        el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
      prog: max > 0 ? el.scrollLeft / max : 0,
    });
  }, []);

  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;

    actualizarBordes();
    el.addEventListener("scroll", actualizarBordes, { passive: true });
    const observador = new ResizeObserver(actualizarBordes);
    observador.observe(el);

    return () => {
      el.removeEventListener("scroll", actualizarBordes);
      observador.disconnect();
    };
  }, [actualizarBordes, items.length]);

  /** Mueve el carrusel por "páginas" de tarjetas completas. */
  const desplazar = (direccion: 1 | -1) => {
    const el = pistaRef.current;
    if (!el) return;

    const tarjeta = el.querySelector<HTMLElement>(".historial_item");
    const paso = (tarjeta?.offsetWidth ?? 260) + GAP_TARJETAS;
    const visibles = Math.max(1, Math.floor(el.clientWidth / paso));
    const reducir = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    el.scrollBy({
      left: direccion * visibles * paso,
      behavior: reducir ? "auto" : "smooth",
    });
  };

  // ---- Arrastre con mouse (touch y trackpad usan el scroll nativo) --------
  const alPresionar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = pistaRef.current;
    if (!el) return;

    arrastre.current = { activo: true, x: e.clientX, scroll: el.scrollLeft };
    setArrastrando(true);
    el.setPointerCapture(e.pointerId);
  };

  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current.activo) return;
    const el = pistaRef.current;
    if (!el) return;

    el.scrollLeft = arrastre.current.scroll - (e.clientX - arrastre.current.x);
  };

  const alSoltar = (e: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current.activo) return;
    arrastre.current.activo = false;
    setArrastrando(false);

    const el = pistaRef.current;
    if (el?.hasPointerCapture(e.pointerId))
      el.releasePointerCapture(e.pointerId);
  };

  // ---- Vacío --------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="historial_carrusel">
        <div
          className="historial_vacio"
          role="status"
          aria-live="polite"
          aria-label="Aún no hay actividad registrada"
        >
          <p>Aún no hay actividad registrada.</p>
        </div>
      </div>
    );
  }

  // `inicio` = posición global del primer movimiento del día (escalona la
  // animación de entrada a lo largo de todo el carrusel).
  let acumulado = 0;
  const grupos = agruparPorDia(items).map((grupo) => {
    const inicio = acumulado;
    acumulado += grupo.items.length;
    return { ...grupo, inicio };
  });

  return (
    <div
      className="historial_carrusel"
      data-izq={bordes.izq}
      data-der={bordes.der}
    >
      <button
        type="button"
        className="historial_flecha historial_flecha--izq"
        onClick={() => desplazar(-1)}
        disabled={!bordes.izq}
        aria-label="Desplazar el historial a la izquierda"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      <div
        ref={pistaRef}
        className={`metrica_historial_contenedor${
          arrastrando ? " metrica_historial_contenedor--arrastrando" : ""
        }`}
        // Región con scroll: enfocable para poder moverla con las flechas
        // del teclado.
        role="region"
        aria-label="Línea de tiempo de movimientos"
        tabIndex={0}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
      >
        {grupos.map((grupo) => (
          <div className="historial_grupo_dia" key={grupo.fecha}>
            <div className="historial_separador_dia">
              <span>
                {formatearFechaRelativa(new Date(grupo.items[0].fecha))}
              </span>
            </div>

            <ol className="historial_linea_tiempo">
              {grupo.items.map((item, posicion) => {
                const estilo = ESTILO_ACCION[item.accion];
                const IconoComponente = estilo.icono;

                return (
                  <li
                    className="historial_item"
                    key={item.id_historial}
                    style={{ "--i": grupo.inicio + posicion } as CSSProperties}
                    aria-label={`${estilo.etiqueta} en ${capitalizarModulo(
                      item.modulo,
                    )} a las ${formatearHora(item.fecha)}`}
                  >
                    <div
                      className={`historial_punto punto_${estilo.color}`}
                      aria-hidden="true"
                    >
                      <IconoComponente
                        size={12}
                        className="historial_punto_icono"
                      />
                    </div>

                    <div className="historial_tarjeta">
                      <div className="historial_tarjeta_encabezado">
                        <span className={`historial_pill pill_${estilo.color}`}>
                          <IconoComponente size={13} aria-hidden="true" />
                          {estilo.etiqueta}
                        </span>
                        <span className="historial_modulo">
                          <IconoModulo modulo={item.modulo} size={12} />
                          {capitalizarModulo(item.modulo)}
                        </span>
                        <time className="historial_hora">
                          {formatearHora(item.fecha)}
                        </time>
                      </div>

                      <p className="historial_descripcion">
                        {item.descripcion}
                      </p>

                      <p className="historial_autor">
                        -- {item.nombre} {item.apellido} --
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="historial_flecha historial_flecha--der"
        onClick={() => desplazar(1)}
        disabled={!bordes.der}
        aria-label="Desplazar el historial a la derecha"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>

      {bordes.ratio < 1 && (
        <div className="historial_progreso" aria-hidden="true">
          <span
            className="historial_progreso_barra"
            style={{
              width: `${bordes.ratio * 100}%`,
              left: `${bordes.prog * (1 - bordes.ratio) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
