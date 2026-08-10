import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

import { CalendarClock, Clock3, UserCheck, CalendarDays } from "lucide-react";

// Componentes
import { CompoError } from "../../../componentes/generales/Error/Error";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { Inputs } from "../../../componentes/generales/Inputs/Inputs";
import { LogoExito } from "../../../componentes/generales/CuadroExito/CuadroExito";

// Hook
import { useAsistenciaSet } from "../../../hookNegocios/asistencia";

// CSS
import "./formularioAsistencia.css";

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
      {/* ================= HEADER ================= */}

      <header className="asistencia_header">
        <h1>{state.nombreEscuela} </h1>

        <p>Registro automático de asistencia</p>
      </header>

      {/* ================= PANEL CENTRAL ================= */}

      <main className="asistencia_panel">
        {/* ----------- CLASES ----------- */}

        <section className="asistencia_clases">
          <div className="clase_card actual">
            <div className="clase_badge">
              <span className="badge actual">
                <Clock3 size={13} />
                EN CURSO
              </span>
            </div>

            <div className="clase_contenido">
              <h2>
                {state.claseEnCurso && "nombre_clase" in state.claseEnCurso
                  ? state.claseEnCurso.nombre_clase
                  : "Sin clase en curso"}
              </h2>

              <p>
                <CalendarClock size={16} />

                {state.claseEnCurso && "hora_inicio" in state.claseEnCurso
                  ? state.claseEnCurso.hora_inicio
                  : "00:00"}

                <span className="separador_hora">→</span>

                {state.claseEnCurso && "hora_fin" in state.claseEnCurso
                  ? state.claseEnCurso.hora_fin
                  : "00:00"}
              </p>
            </div>
          </div>

          <div className="clase_card proxima">
            <div className="clase_badge">
              <span className="badge proxima">
                <CalendarDays size={13} />
                PRÓXIMA
              </span>
            </div>

            <div className="clase_contenido">
              <h2>
                {state.claseProxima && "nombre_clase" in state.claseProxima
                  ? state.claseProxima.nombre_clase
                  : "Sin más clases por hoy"}
              </h2>

              <p>
                <CalendarClock size={16} />

                {state.claseProxima && "hora_inicio" in state.claseProxima
                  ? state.claseProxima.hora_inicio
                  : "00:00"}

                <span className="separador_hora">→</span>

                {state.claseProxima && "hora_fin" in state.claseProxima
                  ? state.claseProxima.hora_fin
                  : "00:00"}
              </p>
            </div>
          </div>
        </section>

        {/* ----------- FORMULARIO ----------- */}

        <section className="asistencia_accion">
          <div className="titulo_accion">
            <UserCheck size={18} />
            <span>Identificación del alumno</span>
          </div>

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

          {/* ----------- ESTADO ----------- */}

          <div className="estado_inscripcion">
            <div className="estado_card">
              <span>Vencimiento</span>

              <strong>
                {state.dataInscripcion?.vencimiento || "----/--/--"}
              </strong>
            </div>

            <div className="estado_card">
              <span>Clases restantes</span>

              <strong>{state.dataInscripcion?.clases_restantes || "-"}</strong>
            </div>
          </div>

          <Boton
            clase="aceptar"
            texto="Registrar asistencia"
            logo="Go"
            onClick={handleResgistrarAsistencia}
          />

          {state.errorGenerico && <CompoError mensaje={state.errorGenerico} />}

          {state.exitoAsistencia &&
            createPortal(
              <div className="overlay-exito">
                <div className="card-exito">
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                    }}
                  >
                    <LogoExito />
                  </div>

                  <h2>¡Asistencia registrada!</h2>

                  <p>Que disfrutes la clase.</p>
                </div>
              </div>,
              document.body,
            )}
        </section>
      </main>
    </div>
  );
};
