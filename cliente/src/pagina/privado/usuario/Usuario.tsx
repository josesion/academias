import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";
import { FormHorario } from "../../../componentes/FormularioHorario/FormHorario";

import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";

import "./usuario.css";

export const UsuarioPage = () => {
  // Hooks de inscripciones
  const {
    plan,
    alumno,
    errorGenerico,
    listadoPlan,
    listadoAlumno,
    handleCachearPlan,
    handleCachearAlumno,
    handleInscribir,
    handleCancelar,
    modalInsc,
    setModalInsc,
  } = useIncripcionesUsuarios();

  // Hooks de horarios
  const {
    profesores,
    niveles,
    tipo,
    horaInicioFin,
    diaHorario,
    metodo,
    modalInterno,
    modalHorario,
    setModalHorario,
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
    hanldeVolver,
    horarios,
    diasSemana,
  } = useHorariosUsuarios();

  return (
    <div className="usuario_contenedor">
      {/* MODALES */}
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

      {modalHorario && (
        <div className="formulario_overlay">
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
            handleVolver={hanldeVolver}
          />
        </div>
      )}

      {/* SECCIÓN DE METRICAS Y BOTONES */}
      <div className="usuario_header">
        <h2>Panel de Usuario</h2>
        <p>Aquí podes ver tus métricas o estadísticas.</p>

        <div className="usuario_botones">
          <button onClick={() => setModalInsc(true)}>
            Agregar Inscripción
          </button>
          <button onClick={() => setModalHorario(true)}>Agregar Horario</button>
        </div>
      </div>

      {/* EJEMPLO DE METRICAS */}
      <div className="usuario_metricas">
        <div className="metrica_card">
          <h3>Total Alumnos</h3>
          <p>120</p>
        </div>
        <div className="metrica_card">
          <h3>Clases este mes</h3>
          <p>45</p>
        </div>
        <div className="metrica_card">
          <h3>Profesores activos</h3>
          <p>8</p>
        </div>
      </div>
    </div>
  );
};
