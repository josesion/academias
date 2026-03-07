import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";
import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";

export const InscripcionPage = () => {
  // Hooks de inscripciones
  const {
    plan,
    alumno,
    notas,
    enviando,
    errorGenerico,
    listadoPlan,
    listadoAlumno,
    handleCachearPlan,
    handleCachearAlumno,
    handleCachearMetodoPago,
    handleTextAreaNotas,
    handleInscribir,
    handleCancelar,
  } = useIncripcionesUsuarios();

  return (
    <div className="usuario_contenedor">
      <InscripcionForm
        errorGenerico={errorGenerico}
        listadoPlan={listadoPlan}
        plan={plan}
        handleCachearPlan={handleCachearPlan}
        listadoAlumno={listadoAlumno}
        alumno={alumno}
        handleCachearAlumno={handleCachearAlumno}
        inscribir={handleInscribir}
        cancelar={handleCancelar}
        handleCachearMetodoPago={handleCachearMetodoPago}
        handleTextAreaNotas={handleTextAreaNotas}
        notas={notas}
        enviando={enviando}
      />
    </div>
  );
};
