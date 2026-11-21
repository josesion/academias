import { useId } from "react";
import { useContext } from "react";
import { CalendarDays, ArrowUpCircle } from "lucide-react";
import { RutasProtegidasContext } from "../../../contexto/protectRutas";
import { FormHorario } from "../../../componentes/Horarios/FormularioHorario/FormHorario";
import { FormularioHorarioGym } from "../../../componentes/HorariosGym/FormularioHorarioGym";
import { SelectorOpt } from "../../../componentes/generales/CompSelecObt/SelectorOpt";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";
import { useHorariosGym } from "../../../hookNegocios/horariosGym";
import type { DataSala } from "../../../tipadosTs/sala";
import "./horarios.css";

export const HorarioPagina = () => {
  const { rol } = useContext(RutasProtegidasContext);
  const esGym = rol?.rubro === "gym";

  // Hooks de horarios Baile
  const {
    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,
    handleCachearSalas,
    handleSeleccionarSala,
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

  // Hook de horarios Gym
  const gymHook = useHorariosGym();

  const formId = useId();
  const calendarioId = useId();

  // Gym: usar FormularioHorarioGym (sin niveles)
  if (esGym) {
    return (
      <div className="horarios_pagina">
        <header className="horarios_encabezado">
          <h1>Horarios de Clases (Gym)</h1>
          {gymHook.state.salaSeleccionada && (
            <span className="horarios_sala_activa" role="status">
              <span className="horarios_sala_activa_dot" aria-hidden="true" />
              Viendo: {gymHook.state.salaSeleccionada.nombre}
            </span>
          )}
        </header>

        {/* Selector de sala como entrada principal */}
        <div className="horarios_sala_selector">
          <SelectorOpt<DataSala>
            categorias={gymHook.state.listaSalas}
            itemKey="id"
            itemLabel="nombre"
            value={gymHook.state.salaSeleccionada?.id ?? ""}
            onChangeSelector={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const idSala = Number(e.target.value) || null;
              const salaEncontrada = idSala ? gymHook.state.listaSalas.find(s => s.id === idSala) ?? null : null;
              gymHook.handleSeleccionarSala(salaEncontrada);
            }}
            labelDefault="Elegí una sala para ver sus horarios"
            disabled={gymHook.state.carga.salas}
            ariaLabel="Elegir sala para ver horarios"
          />
          {gymHook.state.carga.salas && (
            <p className="horarios_carga_sala" role="status">Cargando salas…</p>
          )}
        </div>

        {!gymHook.state.salaSeleccionada && (
          <div className="horarios_bienvenida" role="status">
            <ArrowUpCircle size={32} strokeWidth={1.5} className="horarios_bienvenida_flecha" aria-hidden="true" />
            <CalendarDays size={48} strokeWidth={1.5} />
            <p>Elegí una sala del selector de arriba para comenzar</p>
          </div>
        )}

        {gymHook.state.salaSeleccionada && (
          <>
            <section aria-labelledby={formId} className="horarios_form_section">
              <h2 id={formId} className="visually-hidden">Formulario de horario Gym</h2>
              <FormularioHorarioGym
                metodo={gymHook.state.metodo}
                carga={gymHook.state.carga}
                modalInterno={gymHook.state.modalInterno}
                mensajeEstado={gymHook.state.errorGenericoHorario as string}
                horaInicioFin={gymHook.state.horaInicioFin}
                diaHorario={gymHook.state.diaHorario}
                profesores={gymHook.state.profesores}
                listaProfe={gymHook.state.listaProfe}
                sala={gymHook.state.sala}
                listaSalas={gymHook.state.listaSalas}
                salaSeleccionada={gymHook.state.salaSeleccionada}
                tipo={gymHook.state.tipo}
                listaTipo={gymHook.state.listaTipo}
                horarios={gymHook.horarios}
                diasSemana={gymHook.diasSemana}
                calendario={gymHook.state.calendario}
                handleCachearProfesores={gymHook.handleCachearProfesores}
                handleCachearSalas={gymHook.handleCachearSalas}
                handleCachearTipos={gymHook.handleCachearTipos}
                handleAlta={gymHook.handleAltaHorario}
                handleMoficar={gymHook.handleModHorario}
                handleCancelar={gymHook.handleCerrarModal}
                handleEliminar={gymHook.handleEliminarHorario}
                handleVolver={gymHook.handleVolver}
                handleModificarData={gymHook.handleAbrirModificarHorario}
                handleAbrirModal={gymHook.handleAbrirModal}
              />
            </section>

            <section aria-labelledby={calendarioId} className="horarios_calendario_section">
              <h2 id={calendarioId} className="visually-hidden">Calendario semanal Gym</h2>
            </section>
          </>
        )}
      </div>
    );
  }

  // Baile: usar FormHorario (con niveles)
  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <div className="horarios_pagina">
      {/* Sin overlay global de carga (spec 038): la carga se marca en el
          control que la dispara (los selects y el encabezado del calendario),
          así la UI nunca se tapa. */}

      <header className="horarios_encabezado">
        <h1>Horarios de Clases</h1>
        {state.salaSeleccionada && (
          <span className="horarios_sala_activa" role="status">
            <span className="horarios_sala_activa_dot" aria-hidden="true" />
            Viendo: {state.salaSeleccionada.nombre}
          </span>
        )}
      </header>

      {/* Selector de sala como entrada principal */}
      <div className="horarios_sala_selector">
        <SelectorOpt<DataSala>
          categorias={state.listaSalas}
          itemKey="id"
          itemLabel="nombre"
          value={state.salaSeleccionada?.id ?? ""}
          onChangeSelector={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const idSala = Number(e.target.value) || null;
            const salaEncontrada = idSala ? state.listaSalas.find(s => s.id === idSala) ?? null : null;
            handleSeleccionarSala(salaEncontrada);
          }}
          labelDefault="Elegí una sala para ver sus horarios"
          disabled={state.carga.salas}
          ariaLabel="Elegir sala para ver horarios"
        />
        {state.carga.salas && (
          <p className="horarios_carga_sala" role="status">Cargando salas…</p>
        )}
      </div>

      {!state.salaSeleccionada && (
        <div className="horarios_bienvenida" role="status">
          <ArrowUpCircle size={32} strokeWidth={1.5} className="horarios_bienvenida_flecha" aria-hidden="true" />
          <CalendarDays size={48} strokeWidth={1.5} />
          <p>Elegí una sala del selector de arriba para comenzar</p>
        </div>
      )}

      {state.salaSeleccionada && (
        <>
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
              listaSalas={state.listaSalas}
              handleCachearSalas={handleCachearSalas}
              sala={state.sala}
              salaSeleccionada={state.salaSeleccionada}
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
        </>
      )}
    </div>
  );
};
