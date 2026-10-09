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

  return (
    <div className="usuario_contenedor">
      {/* Esta página no tenía ningún encabezado (spec 016): el título principal
          se lo agrega el componente de arriba del todo. */}
      <h1 className="pagina_inscripcion_titulo">Inscripción de alumnos</h1>

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
    </div>
  );
};
