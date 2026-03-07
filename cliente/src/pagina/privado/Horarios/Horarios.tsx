import { FormHorario } from "../../../componentes/FormularioHorario/FormHorario";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";

export const HorarioPagina = () => {
  // Hooks de horarios
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
    hanldeVolver,
    horarios,
    diasSemana,
  } = useHorariosUsuarios();

  return (
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
  );
};
