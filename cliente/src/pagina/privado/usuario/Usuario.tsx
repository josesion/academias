import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";
import { FormHorario } from "../../../componentes/FormularioHorario/FormHorario";

import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";

import "./usuario.css";

export const UsuarioPage = () => {
  const {
    plan,
    alumno,
    errorGenerico,
    modalInsc,
    listadoPlan,
    listadoAlumno,
    handleCachearPlan,
    handleCachearAlumno,
    handleInscribir,
    handleCancelar,
  } = useIncripcionesUsuarios();

  const {
    profesores,
    niveles,
    tipo,
    horaInicioFin,
    diaHorario,
    metodo,
    modalInterno,
    errorGenericoHorario,
    listaProfe,
    listaNiveles,
    listaTipo,
    calendario,
    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,
    handleModHorario,
    handleAbirModalHoarios,
    handleAbrirModificarHorario,
    handleCerrarModalHoarios,
    handleAltaHorario,
    handleEliminarHorario,
    horarios,
    diasSemana,
  } = useHorariosUsuarios();

  return (
    <div className="usuario_contenedor">
      {modalInsc && (
        <div className="formulario_overlay">
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
          />
        </div>
      )}

      <div>
        <FormHorario
          metodo={metodo}
          mensajeEstado={errorGenericoHorario as string}
          horaInicioFin={horaInicioFin}
          diasSemana={diasSemana}
          horarios={horarios}
          diaHorario={diaHorario}
          calendario={calendario}
          modalInterno={modalInterno}
          listaProfe={listaProfe}
          handleCachearProfesores={handleCachearProfesores}
          profesores={profesores}
          listaNiveles={listaNiveles}
          handleCachearNiveles={handleCachearNiveles}
          nilveles={niveles}
          listaTipo={listaTipo}
          handleCachearTipos={handleCachearTipos}
          tipo={tipo}
          handleModificarData={handleAbrirModificarHorario}
          handleAbrirModal={handleAbirModalHoarios}
          handleCancelar={handleCerrarModalHoarios}
          handleAlta={handleAltaHorario}
          handleMoficar={handleModHorario}
          handleEliminar={handleEliminarHorario}
        />
      </div>
    </div>
  );
};
