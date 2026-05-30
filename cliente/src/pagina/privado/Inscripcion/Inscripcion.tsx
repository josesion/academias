import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";
import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";

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

  console.log(state.errorGenerico);

  return (
    <div className="usuario_contenedor">
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
