import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuMapPin,
  LuPhone,
  LuIdCard,
  LuCalendarDays,
  LuCircleAlert,
  LuCircleCheck,
  LuCircleHelp,
  LuCircleSlash,
  LuCircleX,
} from "react-icons/lu";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { obtenerIniciales } from "../InfoEscuela/InfoEscuela";
import type { EscuelaAlumnoRow } from "../../../servicio/principal.alumnos.fetch";

import "./tarjetaescuela.css";

export interface TarjetaEscuelaProps {
  /** Fila de la escuela devuelta por `GET /api/metricas_principal_alumno/:correo`. */
  escuela: EscuelaAlumnoRow;
  /** Si está cargando la sección de métricas. */
  carga: boolean;
}

/** Variantes del chip de estado del plan (spec 037). */
type EstadoPlan = "nuevo" | "suspendido" | "vencido" | "por_vencer" | "vigente";

/**
 * Calcula el estado del plan de la inscripción activa de la escuela.
 *
 * Precedencia (spec 037, aclaración #21):
 * 1. Sin inscripción (`id_inscripcion === null`) → `nuevo`.
 * 2. Inscripción `suspendido` → `suspendido`.
 * 3. Inscripción `vencidos` o `dias_restantes <= 0` (vence hoy o ya venció) → `vencido`.
 * 4. `dias_restantes <= 5` → `por_vencer`.
 * 5. Resto → `vigente` (incluye `dias_restantes === null`: no se inventa alarma).
 *
 * @param escuela - Fila de la escuela con los datos de la inscripción.
 * @returns La variante del estado del plan.
 */
const estadoPlan = (escuela: EscuelaAlumnoRow): EstadoPlan => {
  if (escuela.id_inscripcion === null) return "nuevo";
  if (escuela.estado_inscripcion === "suspendido") return "suspendido";
  if (escuela.estado_inscripcion === "vencidos") return "vencido";
  if (escuela.dias_restantes !== null && escuela.dias_restantes <= 0) return "vencido";
  if (escuela.dias_restantes !== null && escuela.dias_restantes <= 5) return "por_vencer";
  return "vigente";
};

/**
 * Calcula el porcentaje de clases del plan ya consumidas.
 *
 * Usa `porcentaje_clases_asistidas` del backend; si viene `null` pero hay
 * `clases_plan > 0` y `clases_asistidas`, lo calcula con
 * `clases_asistidas / clases_plan * 100` (mismo criterio que `EstadoPlan.tsx`).
 * El valor se recorta a 0-100 y se redondea con `Math.round`: el texto y el
 * ancho de la barra usan SIEMPRE este mismo número.
 *
 * El dato viene de la red: se valida que sea un número finito antes de
 * usarlo, para no renderizar `NaN%` ni `Infinity%` si la clave llega ausente
 * o corrupta.
 *
 * @param escuela - Fila de la escuela con los datos del plan.
 * @returns Porcentaje entero de 0 a 100, o `null` si no hay un número válido
 *          del que calcularlo.
 */
const porcentajePlan = (escuela: EscuelaAlumnoRow): number | null => {
  let porcentaje: number | null = null;

  if (typeof escuela.porcentaje_clases_asistidas === "number") {
    porcentaje = escuela.porcentaje_clases_asistidas;
  } else if (
    typeof escuela.clases_plan === "number" &&
    escuela.clases_plan > 0 &&
    typeof escuela.clases_asistidas === "number"
  ) {
    porcentaje = (escuela.clases_asistidas / escuela.clases_plan) * 100;
  }

  if (typeof porcentaje !== "number" || !Number.isFinite(porcentaje)) return null;

  return Math.min(100, Math.max(0, Math.round(porcentaje)));
};

/**
 * Formatea una fecha `"YYYY-MM-DD"` como `DD/MM/YYYY`.
 *
 * El parseo es por `split`, nunca con `new Date()`: `new Date("2026-11-16")`
 * se interpreta en UTC y en zonas con offset negativo se corre un día.
 *
 * @param fecha - Fecha en formato `"YYYY-MM-DD"`, o `null`.
 * @returns La fecha en `DD/MM/YYYY`, o `"Sin vencimiento"` si no hay fecha.
 */
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return "Sin vencimiento";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

/**
 * Tarjeta de una academia, en la pantalla "Mis Academias" del alumno.
 *
 * La tarjeta es un `<Link to="/data_escuela" state={{ id_escuela }}>` (spec
 * 014): antes era un `<div onClick>`, que no se podía tabular ni activar con
 * Enter. `DataEscuela` sigue leyendo el id de `location.state`, así que la
 * navegación es idéntica.
 *
 * Además de los datos de siempre (razón social, propietario, DNI, dirección y
 * celular) muestra, según la inscripción activa del alumno (spec 037):
 * - El **logo** de la academia (`url_imagen`) en lugar del avatar de
 *   iniciales. Si la academia no tiene logo o la imagen falla al cargar, se
 *   hace fallback al avatar de iniciales de la **razón social** (mismas
 *   iniciales que muestra la pantalla de detalle: `obtenerIniciales`).
 * - Un **chip de estado** con 5 variantes: `Nuevo`, `Suspendido`, `Vencido`,
 *   `Por vencer` y `Vigente`.
 * - El **bloque de plan** (vencimiento, porcentaje de clases y barra de
 *   progreso) solo cuando el alumno tiene inscripción.
 *
 * @param escuela - Fila de la escuela (datos de la escuela y de su inscripción).
 * @param carga - Si está cargando.
 */
export const TarjetaEscuela = ({ escuela, carga }: TarjetaEscuelaProps) => {
  const [errorImagen, setErrorImagen] = useState(false);

  // Si la academia cambia su logo, se limpia el error previo: si no, la
  // tarjeta quedaría clavada en el avatar de iniciales.
  useEffect(() => {
    setErrorImagen(false);
  }, [escuela.url_imagen]);

  const iniciales = obtenerIniciales(escuela.razon_social);

  const estado = estadoPlan(escuela);
  const porcentaje = porcentajePlan(escuela);
  const hayInscripcion = escuela.id_inscripcion !== null;
  const fechaVencimiento = formatearFecha(escuela.fecha_vencimiento_plan);

  const clasesTexto =
    typeof escuela.clases_asistidas === "number" && typeof escuela.clases_plan === "number"
      ? `${escuela.clases_asistidas} de ${escuela.clases_plan}`
      : "—";

  const etiquetaEstado: Record<EstadoPlan, string> = {
    nuevo: "Nuevo",
    suspendido: "Suspendido",
    vencido: "Vencido",
    por_vencer: "Por vencer",
    vigente: "Vigente",
  };

  const iconoEstado = {
    nuevo: <LuCircleHelp size={14} aria-hidden="true" />,
    suspendido: <LuCircleSlash size={14} aria-hidden="true" />,
    vencido: <LuCircleX size={14} aria-hidden="true" />,
    por_vencer: <LuCircleAlert size={14} aria-hidden="true" />,
    vigente: <LuCircleCheck size={14} aria-hidden="true" />,
  }[estado];

  return (
    <Link
      className="tarjeta_escuela"
      to="/data_escuela"
      state={{ id_escuela: escuela.id_escuela }}
    >
      {carga ? (
        <SpinnerTarjeta />
      ) : (
        <div className="tarjeta_escuela_contenido">
          <div className="tarjeta_escuela_header">
            {escuela.url_imagen && !errorImagen ? (
              <img
                className="tarjeta_escuela_logo"
                src={escuela.url_imagen}
                alt=""
                onError={() => setErrorImagen(true)}
              />
            ) : (
              <div className="tarjeta_escuela_avatar" aria-hidden="true">
                {iniciales}
              </div>
            )}
            <div className="tarjeta_escuela_header_texto">
              <h3 className="tarjeta_escuela_razon">{escuela.razon_social}</h3>
              <p className="tarjeta_escuela_propietario">
                {escuela.nombre_propietario} {escuela.apellido_propietario}
              </p>
            </div>
          </div>

          <span className={`tarjeta_escuela_estado tarjeta_escuela_estado--${estado}`}>
            {iconoEstado}
            {etiquetaEstado[estado]}
          </span>

          <div className="tarjeta_escuela_divisor" />

          <ul className="tarjeta_escuela_datos">
            <li>
              <LuIdCard size={16} />
              <span>DNI {escuela.dni_propietario}</span>
            </li>
            <li>
              <LuMapPin size={16} />
              <span>{escuela.direccion}</span>
            </li>
            <li>
              <LuPhone size={16} />
              <span>{escuela.celular}</span>
            </li>
          </ul>

          {hayInscripcion && (
            <div className="tarjeta_escuela_plan">
              <div className="tarjeta_escuela_plan_fecha">
                <LuCalendarDays size={14} aria-hidden="true" />
                <span>
                  {escuela.fecha_vencimiento_plan ? "Vence el " : ""}
                  <strong>{fechaVencimiento}</strong>
                </span>
              </div>

              <div className="tarjeta_escuela_plan_metas">
                <span className="tarjeta_escuela_meta">
                  <span className="tarjeta_escuela_meta_label">Asistencia</span>
                  <span className="tarjeta_escuela_meta_valor">
                    {porcentaje === null ? "—" : `${porcentaje}%`}
                  </span>
                </span>
                <span className="tarjeta_escuela_meta">
                  <span className="tarjeta_escuela_meta_label">Clases</span>
                  <span className="tarjeta_escuela_meta_valor">{clasesTexto}</span>
                </span>
              </div>

              {porcentaje !== null && (
                <div className="tarjeta_escuela_barra">
                  <div
                    className="tarjeta_escuela_barra_fill"
                    role="progressbar"
                    aria-valuenow={porcentaje}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso del plan: ${porcentaje}% (${clasesTexto} clases)`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Link>
  );
};
