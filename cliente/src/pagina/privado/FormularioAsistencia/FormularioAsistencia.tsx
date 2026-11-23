import { useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

import {
  CalendarClock,
  Clock3,
  UserCheck,
  CalendarDays,
  DoorOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Componentes
import { CompoError } from "../../../componentes/generales/Error/Error";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { Inputs } from "../../../componentes/generales/Inputs/Inputs";
import { LogoExito } from "../../../componentes/generales/CuadroExito/CuadroExito";

// Hook
import { useAsistenciaSet } from "../../../hookNegocios/asistencia";

// CSS
import "./formularioAsistencia.css";

/* ==========================================================
   TIPOS Y HELPERS
   ========================================================== */

type ClaseInfo = {
  nombre_clase: string;
  hora_inicio: string;
  hora_fin: string;
  sala?: string;
  id_horario_clase: number;
};

type ProximaClaseInfo = {
  nombre_clase: string;
  hora_inicio: string;
  hora_fin: string;
  sala?: string;
  id_horario_prox_clase: number;
};

const esHorarioValido = (h: unknown): h is ClaseInfo =>
  typeof h === "object" &&
  h !== null &&
  ("id_horario_clase" in h || "id_horario_en_clase" in h) &&
  "nombre_clase" in h &&
  "hora_inicio" in h;

const esProximaClaseValida = (h: unknown): h is ProximaClaseInfo =>
  typeof h === "object" &&
  h !== null &&
  "id_horario_prox_clase" in h &&
  "nombre_clase" in h &&
  "hora_inicio" in h;

/* ==========================================================
   SUBCOMPONENTES
   ========================================================== */

type TarjetaClaseProps = {
  variante: "actual" | "proxima";
  etiqueta: string;
  Icono: LucideIcon;
  clase: ClaseInfo | ProximaClaseInfo | null;
};

const TarjetaClase = ({
  variante,
  etiqueta,
  Icono,
  clase,
}: TarjetaClaseProps) => {
  if (!clase) return null;

  return (
    <article className={`clase_card card-base ${variante}`}>
      <span className={`badge ${variante}`}>
        <Icono size={13} aria-hidden="true" />
        {etiqueta}
      </span>

      <div className="clase_contenido">
        <h2>{clase.nombre_clase}</h2>
        {clase.sala && <p className="clase_sala">{clase.sala}</p>}

        <p>
          <CalendarClock size={16} aria-hidden="true" />
          <span>{clase.hora_inicio}</span>
          <span className="separador_hora" aria-hidden="true">
            →
          </span>
          <span>{clase.hora_fin}</span>
        </p>
      </div>
    </article>
  );
};

/**
 * Grupo de tarjetas para una sección (En curso / Próxima).
 * Muestra una tarjeta por clase, o un mensaje vacío si no hay clases.
 */
type GrupoClasesProps = {
  variante: "actual" | "proxima";
  etiqueta: string;
  Icono: LucideIcon;
  clases: (ClaseInfo | ProximaClaseInfo)[];
  textoVacio: string;
};

const GrupoClases = ({
  variante,
  etiqueta,
  Icono,
  clases,
  textoVacio,
}: GrupoClasesProps) => {
  if (clases.length === 0) {
    return (
      <article className={`clase_card card-base ${variante} clase_card--vacia`}>
        <span className={`badge ${variante}`}>
          <Icono size={13} aria-hidden="true" />
          {etiqueta}
        </span>
        <div className="clase_contenido">
          <h2>{textoVacio}</h2>
          <p>
            <CalendarClock size={16} aria-hidden="true" />
            <span>00:00</span>
            <span className="separador_hora" aria-hidden="true">
              →
            </span>
            <span>00:00</span>
          </p>
        </div>
      </article>
    );
  }

  return (
    <div className="grupo_clases">
      {clases.map((clase, idx) => (
        <TarjetaClase
          key={`${variante}-${idx}`}
          variante={variante}
          etiqueta={etiqueta}
          Icono={Icono}
          clase={clase}
        />
      ))}
    </div>
  );
};

/**
 * Selector de clase cuando hay múltiples horarios en curso.
 * Muestra tarjetas clickeables con nombre de clase, horario y sala.
 */
type SelectorClaseProps = {
  horarios: ClaseInfo[];
  seleccionada: number | null;
  onSeleccionar: (id: number) => void;
};

const SelectorClase = ({
  horarios,
  seleccionada,
  onSeleccionar,
}: SelectorClaseProps) => (
  <fieldset className="selector_clase">
    <legend>
      <DoorOpen size={16} aria-hidden="true" />
      <span>Seleccioná la clase</span>
    </legend>
    <div className="selector_clase_opciones">
      {horarios.map((h) => {
        const estaSeleccionada = h.id_horario_clase === seleccionada;
        return (
          <button
            key={h.id_horario_clase}
            type="button"
            className={`selector_clase_opcion${estaSeleccionada ? " seleccionada" : ""}`}
            onClick={() => onSeleccionar(h.id_horario_clase)}
            aria-pressed={estaSeleccionada}
          >
            <span className="selector_clase_nombre">{h.nombre_clase}</span>
            <span className="selector_clase_detalle">
              {h.hora_inicio} – {h.hora_fin}
              {h.sala ? ` · ${h.sala}` : ""}
            </span>
          </button>
        );
      })}
    </div>
  </fieldset>
);

const ExitoAsistencia = () =>
  createPortal(
    <div className="overlay-exito">
      <div className="card-exito" role="status" aria-live="polite">
        <div className="card-exito_logo">
          <LogoExito />
        </div>

        <h2>¡Asistencia registrada!</h2>
        <p>Que disfrutes la clase.</p>
      </div>
    </div>,
    document.body,
  );

/* ==========================================================
   COMPONENTE PRINCIPAL
   ========================================================== */

export const FormularioAsistencia = () => {
  const inputDniRef = useRef<HTMLInputElement>(null);

  const {
    handleCachearAlumno,
    handleResgistrarAsistencia,
    handleSeleccionarClase,
    state,
  } = useAsistenciaSet();

  // Extraer las listas de clases del estado (ahora son arrays)
  const clasesEnCurso = useMemo(() => {
    const data = state.claseEnCurso;
    if (Array.isArray(data)) {
      return data
        .filter(esHorarioValido)
        .map((c) => ({
          nombre_clase: c.nombre_clase,
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin,
          sala: c.sala,
          id_horario_clase: c.id_horario_en_clase,
        }));
    }
    return [];
  }, [state.claseEnCurso]);

  const clasesProximas = useMemo(() => {
    const data = state.claseProxima;
    if (Array.isArray(data)) {
      return data
        .filter(esProximaClaseValida)
        .map((c) => ({
          nombre_clase: c.nombre_clase,
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin,
          sala: c.sala,
          id_horario_prox_clase: c.id_horario_prox_clase,
        }));
    }
    return [];
  }, [state.claseProxima]);

  // Horarios del dataAsistencia (para el selector de clase al registrar)
  const horariosEnCurso = useMemo(() => {
    const dataHorario = state.dataAsistencia.dataHorario;
    if (Array.isArray(dataHorario)) {
      return dataHorario.filter(esHorarioValido);
    }
    return [];
  }, [state.dataAsistencia.dataHorario]);

  const hayMultiplesClases = horariosEnCurso.length > 1;

  useEffect(() => {
    if (!state.exitoAsistencia) {
      inputDniRef.current?.focus();
    }
  }, [state.exitoAsistencia]);

  return (
    <div className="asistencia_kiosco">
      <header className="asistencia_header">
        <h1>{state.nombreEscuela}</h1>
        <p>Registro automático de asistencia</p>
      </header>

      <main className="asistencia_panel">
        <section className="asistencia_clases" aria-label="Clases de hoy">
          <GrupoClases
            variante="actual"
            etiqueta="En curso"
            Icono={Clock3}
            clases={clasesEnCurso}
            textoVacio="Sin clase en curso"
          />

          <GrupoClases
            variante="proxima"
            etiqueta="Próxima"
            Icono={CalendarDays}
            clases={clasesProximas}
            textoVacio="Sin más clases por hoy"
          />
        </section>

        <section
          className="asistencia_accion"
          aria-labelledby="asistencia_titulo"
        >
          <h2 className="titulo_accion" id="asistencia_titulo">
            <UserCheck size={18} aria-hidden="true" />
            <span>Identificación del alumno</span>
          </h2>

          <Inputs
            label="Ingrese su PIN de asistencia"
            placeholder="Ej: 2372"
            name="pin_asistencia"
            type="text"
            inputMode="numeric"
            maxLength={4}
            ref={inputDniRef}
            value={state.registroAsistencia.pin_asistencia}
            readonly={false}
            onChange={handleCachearAlumno}
          />

          {/* Selector de clase cuando hay múltiples horarios en curso */}
          {hayMultiplesClases && (
            <SelectorClase
              horarios={horariosEnCurso}
              seleccionada={state.claseSeleccionada}
              onSeleccionar={handleSeleccionarClase}
            />
          )}

          <dl className="estado_inscripcion">
            <div className="estado_card">
              <dt>Vencimiento</dt>
              <dd>{state.dataInscripcion?.vencimiento || "----/--/--"}</dd>
            </div>

            <div className="estado_card">
              <dt>Clases restantes</dt>
              {/* ?? y no ||: con 0 clases restantes tiene que mostrar "0" */}
              <dd>{state.dataInscripcion?.clases_restantes ?? "-"}</dd>
            </div>
          </dl>

          <Boton
            clase="aceptar"
            texto="Registrar asistencia"
            logo="Go"
            onClick={handleResgistrarAsistencia}
          />

          {state.errorGenerico && <CompoError mensaje={state.errorGenerico} />}
        </section>
      </main>

      {state.exitoAsistencia && <ExitoAsistencia />}
    </div>
  );
};
