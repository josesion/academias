import { FormHorario } from "../../../componentes/FormularioHorario/FormHorario";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";

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

  return (
    <FormHorario
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
  );
};
