// ===================================
//  SECCIÓN : IMPORTACIONES
// (Componentes de UI y Hooks de Lógica)
// ===================================
import { AmbVistas } from "../../../componentes/Crud/AbmVista/AbmVista";
import { useAbmAlumnos } from "../../../utils/abmAlumnos";

// ===================================
// COMPONENTE PRINCIPAL
// ===================================
export const AmbAlumnos = () => {
  //  Desestructuración del Custom Hook (Lógica de Negocio)
  const {
    //  Estados y Datos
    inputsFiltro,
    inputsFormulario,
    estados,
    dataListado,
    modal,
    modalEliminar,
    formData,
    barraPaginacion,
    carga,
    enProceso,
    estadoListado,
    filtroData,
    tipoFormulario,
    accionEliminar,
    textoboton,
    entidad,
    tituloPagina,

    //  Errores y Validaciones
    errorsZod,
    errorGenerico,

    //  Manejadores de Eventos
    handleChangeBuscador,
    handleCancelar,
    handleSubmit,
    handleChangeFormulario,
    handleAgragar,
    handleEstado,
    handlePaginaCambiada,
    handleModificar,
    handleEliminar,
    handleCancelarEliminar,
    handleSubmitEliminar,
  } = useAbmAlumnos();

  //  Lógica específica del componente (Manipulación de inputs en modificación)
  // En modificación: el email es readonly (es el identificador único),
  // el DNI es editable, y el PIN se muestra de solo lectura.
  const inputsModificar = inputsFormulario.map((input) => {
    if (tipoFormulario === "modificar") {
      if (input.name === "email") {
        return {
          ...input,
          readonly: true,
          hint: "Este correo es el usuario de acceso del alumno. Para cambiarlo, el alumno debe hacerlo desde su cuenta.",
        };
      }
      if (input.name === "dni") {
        // En modificación, el DNI es editable (puede agregarse o cambiarse)
        return { ...input, readonly: false };
      }
      if (input.name === "pin_asistencia") {
        // El PIN siempre es de solo lectura
        return { ...input, readonly: true };
      }
    }
    return input;
  });

  //  Renderizado (Paso de props al componente de Vista)
  return (
    <AmbVistas
      // PROPS DE FORMULARIO Y MODAL ===
      modal={modal}
      modalEliminar={modalEliminar}
      tipoFormulario={tipoFormulario}
      entidad={entidad}
      tituloPagina={tituloPagina}
      // Lógica para elegir qué inputs mostrar
      inputsEntidad={
        tipoFormulario === "alta" ? inputsFormulario : inputsModificar
      }
      formData={formData}
      // Manejo de Errores y Validación
      errorsZod={errorsZod}
      errorGenerico={errorGenerico}
      // Handlers de Formulario
      onHandleCancelar={handleCancelar}
      onHandleChangeFormulario={handleChangeFormulario}
      onHandleSubmit={handleSubmit}
      //  PROPS DE FILTRO Y LISTADO ===
      inputsFiltro={inputsFiltro}
      filtroData={filtroData}
      estados={estados}
      onHandleChangeBuscador={handleChangeBuscador}
      onHandleAgregar={handleAgragar}
      onHandleEstado={handleEstado}
      // PROPS DE ESTADO DE LISTADO Y ACCIONES ===
      carga={carga}
      enProceso={enProceso}
      error={estadoListado.error} // Usando el error del estadoListado
      statuscode={estadoListado.statuscode} // Usando el statuscode del estadoListado
      // Acciones de la tabla
      onEliminar={handleEliminar}
      onModificar={handleModificar}
      // Acciones de Modal de Eliminación
      onHandleCancelarEliminar={handleCancelarEliminar}
      onHandleSubmitEliminar={handleSubmitEliminar}
      accionEliminar={accionEliminar}
      // Paginación y Datos
      botonTexto={textoboton}
      barraPaginacion={barraPaginacion}
      dataAlumnosListado={dataListado}
      onHandlePaginaCambiada={handlePaginaCambiada}
    />
  );
};
