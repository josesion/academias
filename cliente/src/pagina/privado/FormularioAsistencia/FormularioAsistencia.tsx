import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { CalendarClock, Clock3, UserCheck, CalendarDays } from "lucide-react";
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
};

// El hook puede devolver una clase, un objeto sin datos o null.
const esClase = (clase: unknown): clase is ClaseInfo =>
  typeof clase === "object" &&
  clase !== null &&
  "nombre_clase" in clase &&
  "hora_inicio" in clase &&
  "hora_fin" in clase;

/* ==========================================================
   SUBCOMPONENTES
   ========================================================== */

type TarjetaClaseProps = {
  variante: "actual" | "proxima";
  etiqueta: string;
  Icono: LucideIcon;
  clase: unknown;
  textoVacio: string;
};

const TarjetaClase = ({
  variante,
  etiqueta,
  Icono,
  clase,
  textoVacio,
}: TarjetaClaseProps) => {
  const data = esClase(clase) ? clase : null;

  return (
    <article
      className={`clase_card card-base ${variante}${data ? "" : " clase_card--vacia"}`}
    >
      <span className={`badge ${variante}`}>
        <Icono size={13} aria-hidden="true" />
        {etiqueta}
      </span>

      <div className="clase_contenido">
        <h2>{data ? data.nombre_clase : textoVacio}</h2>

        <p>
          <CalendarClock size={16} aria-hidden="true" />
          <span>{data ? data.hora_inicio : "00:00"}</span>
          <span className="separador_hora" aria-hidden="true">
            →
          </span>
          <span>{data ? data.hora_fin : "00:00"}</span>
        </p>
      </div>
    </article>
  );
};

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

  const { handleCachearAlumno, handleResgistrarAsistencia, state } =
    useAsistenciaSet();

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
          <TarjetaClase
            variante="actual"
            etiqueta="En curso"
            Icono={Clock3}
            clase={state.claseEnCurso}
            textoVacio="Sin clase en curso"
          />

          <TarjetaClase
            variante="proxima"
            etiqueta="Próxima"
            Icono={CalendarDays}
            clase={state.claseProxima}
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
            label="Ingrese su DNI"
            placeholder="Ej: 30023547"
            name="dni_alumno"
            type="number"
            ref={inputDniRef}
            value={state.registroAsistencia.dni_alumno}
            readonly={false}
            onChange={handleCachearAlumno}
          />

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
