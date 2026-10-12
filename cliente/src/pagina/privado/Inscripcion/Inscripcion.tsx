import { useId } from "react";
import { InscripcionForm } from "../../../componentes/Inscripciones/FormInscripcion/Inscripcion";
import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";
import "./inscripcion.css";

export const InscripcionPage = () => {
  // Hooks de inscripciones
  const {
    // plan,
    // alumno,
    // notas,
    // enviando,
    // errorGenerico,
    // listadoPlan,
    // listadoAlumno,
    state,
    handleCachearPlan,
    handleCachearAlumno,
    handleCachearMetodoPago,
    handleTextAreaNotas,
    handleInscribir,
    handleCancelar,
  } = useIncripcionesUsuarios();

  const formId = useId();

  return (
    <main className="usuario_contenedor" role="main">
      {/* Carga global mientras se envia la inscripcion */}
      {state.enviando && (
        <div className="carga-global" aria-live="polite" aria-busy="true">
          <div className="spinner" aria-hidden="true" />
          <span className="visually-hidden">Procesando inscripcion...</span>
        </div>
      )}

      {/* Encabezado de la pagina. El <h1> visible ya estaba (spec 016). */}
      <header className="pagina_inscripcion_encabezado">
        <h1 className="pagina_inscripcion_titulo">Inscripción de alumnos</h1>
      </header>

      <section aria-labelledby={formId} className="pagina_inscripcion_seccion">
        <h2 id={formId} className="visually-hidden">Formulario de inscripcion</h2>
        <InscripcionForm
          errorGenerico={state.errorGenerico}
          listadoPlan={state.listadoPlan}
          plan={state.plan}
          handleCachearPlan={handleCachearPlan}
          listadoAlumno={state.listadoAlumno}
          alumno={state.alumno}
          handleCachearAlumno={handleCachearAlumno}
          inscribir={handleInscribir}
          cancelar={handleCancelar}
          handleCachearMetodoPago={handleCachearMetodoPago}
          handleTextAreaNotas={handleTextAreaNotas}
          notas={state.notas}
          enviando={state.enviando}
          listaMetodo={state.listadoMetodoPago}
        />
      </section>
    </main>
  );
};
