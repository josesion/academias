// ===================================
//  SECCIÓN : IMPORTACIONES
// (Componentes de UI y Hooks de Lógica)
// ===================================
import { AmbVistas } from "../../componentes/AbmVista/AbmVista";
import { setAbmCategoriaCaja } from "../../hookNegocios/ambCategoria.caja";

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

export const AmbCategoriasCajaUsuarios = () => {
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
    estadoListado,
    filtroData,
    tipoFormulario,
    accionEliminar,
    textoboton,
    entidad,

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
    handleItems,
    handleItemsFormulario,
    handlePaginaCambiada,
    handleModificar,
    handleEliminar,
    handleCancelarEliminar,
    handleSubmitEliminar,
  } = setAbmCategoriaCaja();

  //  Lógica específica del componente (Manipulación del input 'dni')
  // Se ejecuta para hacer el campo 'dni' de solo lectura si estamos modificando.
  const inputsModificar = inputsFormulario.map((input) => {
    if (tipoFormulario === "modificar" && input.name === "id") {
      return { ...input, readonly: true };
    }
    return input;
  });

  return (
    <AmbVistas
      // PROPS DE FORMULARIO Y MODAL ===
      modal={modal}
      modalEliminar={modalEliminar}
      tipoFormulario={tipoFormulario}
      entidad={entidad}
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
      onHandleItemsFormulario={handleItemsFormulario}
      //  PROPS DE FILTRO Y LISTADO ===
      inputsFiltro={inputsFiltro}
      filtroData={filtroData}
      estados={estados}
      onHandleChangeBuscador={handleChangeBuscador}
      onHandleAgregar={handleAgragar}
      onHandleEstado={handleEstado}
      onHandleItems={handleItems}
      // PROPS DE ESTADO DE LISTADO Y ACCIONES ===
      carga={carga}
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
