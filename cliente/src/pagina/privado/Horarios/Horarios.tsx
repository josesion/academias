import { useId } from "react";
import { FormHorario } from "../../../componentes/Horarios/FormularioHorario/FormHorario";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";
import "./horarios.css";

export const HorarioPagina = () => {
  // Hooks de horarios
  const {
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
    state,
  } = useHorariosUsuarios();

  const formId = useId();
  const calendarioId = useId();

  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <div className="horarios_pagina">
      {/* Sin overlay global de carga (spec 038): la carga se marca en el
          control que la dispara (los selects y el encabezado del calendario),
          así la UI nunca se tapa. */}

      <header className="horarios_encabezado">
        <h1 className="visually-hidden">Gestión de Horarios</h1>
      </header>

      <section aria-labelledby={formId} className="horarios_form_section">
        <h2 id={formId} className="visually-hidden">Formulario de horario</h2>
        <FormHorario
          carga={state.carga}
          metodo={state.metodo}
          mensajeEstado={state.errorGenericoHorario as string}
          horaInicioFin={state.horaInicioFin}
          diasSemana={diasSemana}
          horarios={horarios}
          diaHorario={state.diaHorario}
          calendario={state.calendario}
          modalInterno={state.modales.modalInterno}
          listaProfe={state.listaProfe}
          handleCachearProfesores={handleCachearProfesores}
          profesores={state.profesores}
          listaNiveles={state.listaNiveles}
          handleCachearNiveles={handleCachearNiveles}
          nilveles={state.niveles}
          listaTipo={state.listaTipo}
          handleCachearTipos={handleCachearTipos}
          tipo={state.tipo}
          handleModificarData={handleAbrirModificarHorario}
          handleAbrirModal={handleAbirModalHoarios}
          handleCancelar={handleCerrarModalHoarios}
          handleAlta={handleAltaHorario}
          handleMoficar={handleModHorario}
          handleEliminar={handleEliminarHorario}
          handleVolver={hanldeVolver}
        />
      </section>

      <section aria-labelledby={calendarioId} className="horarios_calendario_section">
        <h2 id={calendarioId} className="visually-hidden">Calendario semanal</h2>
        {/* El calendario se renderiza dentro de FormHorario */}
      </section>
    </div>
  );
};
