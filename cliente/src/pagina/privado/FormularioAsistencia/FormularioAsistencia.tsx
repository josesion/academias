import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// Compontenes
import { CompoError } from "../../../componentes/Error/Error";
import { Boton } from "../../../componentes/Boton/Boton";
import { Inputs } from "../../../componentes/Inputs/Inputs";
import { LogoExito } from "../../../componentes/CuadroExito/CuadroExito";

import { useAsistenciaSet } from "../../../hookNegocios/asistencia";

//css
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
      <header className="asistencia_header">
        <h1>Academia Fuerza Gigante</h1>
        <p>Registro de asistencia</p>
      </header>
      {/* ───────── CLASES ───────── */}
      <section className="asistencia_clases">
        <div className="clase_card actual">
          <span className="badge">EN CURSO</span>
          <h2>
            {state.claseEnCurso && "nombre_clase" in state.claseEnCurso
              ? state.claseEnCurso.nombre_clase
              : "Sin clase en curso"}
          </h2>
          <p>
            {state.claseEnCurso && "hora_inicio" in state.claseEnCurso
              ? state.claseEnCurso.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {state.claseEnCurso && "hora_fin" in state.claseEnCurso
              ? state.claseEnCurso.hora_fin
              : "00:00"}
          </p>
        </div>

        <div className="clase_card proxima">
          <span className="badge">PRÓXIMA</span>
          <h2>
            {state.claseProxima && "nombre_clase" in state.claseProxima
              ? state.claseProxima.nombre_clase
              : "Sin mas clases por hoy"}
          </h2>
          <p>
            {" "}
            {state.claseProxima && "hora_inicio" in state.claseProxima
              ? state.claseProxima.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {state.claseProxima && "hora_fin" in state.claseProxima
              ? state.claseProxima.hora_fin
              : "00:00"}
          </p>
        </div>
      </section>
      {/* ───────── ACCIÓN ───────── */}
      <section className="asistencia_accion">
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

        <div className="estado_inscripcion">
          <div>
            <span>Vencimiento : </span>
            <strong>
              {state.dataInscripcion?.vencimiento || "----/--/--"}
            </strong>
          </div>
          <div>
            <span>Clases restantes : </span>
            <strong>{state.dataInscripcion?.clases_restantes || "-"}</strong>
          </div>
        </div>

        <Boton
          clase="aceptar"
          texto="Asistir a clase"
          logo="Go"
          onClick={handleResgistrarAsistencia}
        />
        {state.errorGenerico && <CompoError mensaje={state.errorGenerico} />}
        {state.exitoAsistencia &&
          createPortal(
            <div className="overlay-exito">
              <div className="card-exito">
                <div style={{ width: "80px", height: "80px" }}>
                  <LogoExito />
                </div>
                <h2>¡Asistencia Exitosa!</h2>
              </div>
            </div>,
            document.body, // Esto lo teletransporta fuera del contenedor con animación
          )}
      </section>
    </div>
  );
};
