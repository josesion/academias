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

  const {
    errorGenerico,
    exitoAsistencia,
    claseEnCurso,
    claseProxima,
    registroAsistencia,
    dataInscripcion,
    handleCachearAlumno,
    handleResgistrarAsistencia,
  } = useAsistenciaSet();

  useEffect(() => {
    if (!exitoAsistencia) {
      inputDniRef.current?.focus();
    }
  }, [exitoAsistencia]);

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
            {claseEnCurso && "nombre_clase" in claseEnCurso
              ? claseEnCurso.nombre_clase
              : "Sin clase en curso"}
          </h2>
          <p>
            {claseEnCurso && "hora_inicio" in claseEnCurso
              ? claseEnCurso.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {claseEnCurso && "hora_fin" in claseEnCurso
              ? claseEnCurso.hora_fin
              : "00:00"}
          </p>
        </div>

        <div className="clase_card proxima">
          <span className="badge">PRÓXIMA</span>
          <h2>
            {claseProxima && "nombre_clase" in claseProxima
              ? claseProxima.nombre_clase
              : "Sin mas clases por hoy"}
          </h2>
          <p>
            {" "}
            {claseProxima && "hora_inicio" in claseProxima
              ? claseProxima.hora_inicio
              : "00:00"}{" "}
            →{" "}
            {claseProxima && "hora_fin" in claseProxima
              ? claseProxima.hora_fin
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
          value={registroAsistencia.dni_alumno}
          readonly={false}
          onChange={handleCachearAlumno}
        />

        <div className="estado_inscripcion">
          <div>
            <span>Vencimiento : </span>
            <strong>{dataInscripcion?.vencimiento || "----/--/--"}</strong>
          </div>
          <div>
            <span>Clases restantes : </span>
            <strong>{dataInscripcion?.clases_restantes || "-"}</strong>
          </div>
        </div>

        <Boton
          clase="aceptar"
          texto="Asistir a clase"
          logo="Go"
          onClick={handleResgistrarAsistencia}
        />
        {errorGenerico && <CompoError mensaje={errorGenerico} />}
        {exitoAsistencia &&
          createPortal(
            <div className="overlay-exito">
              <div className="card-exito">
                <div style={{ width: "80px", height: "80px" }}>
                  <LogoExito />
                </div>
                <h2>¡Asistencia Exitosa!</h2>
              </div>
            </div>,
            document.body // Esto lo teletransporta fuera del contenedor con animación
          )}
      </section>
    </div>
  );
};
