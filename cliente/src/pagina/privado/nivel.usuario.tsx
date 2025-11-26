// ===================================
//  SECCIÓN : IMPORTACIONES
// (Componentes de UI y Hooks de Lógica)
// ===================================
import { AmbVistas } from "../../componentes/AbmVista/AbmVista";
import { useAbmNivelUsuarios } from "../../hookNegocios/abmNivel"; 

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

export const AbmNivelUsuarios = () => {


    const {
        //  Estados y Datos
        inputsFiltro, inputsFormulario, estados, dataListado,
        modal, modalEliminar, formData, barraPaginacion,
        carga, estadoListado, filtroData, tipoFormulario,
        accionEliminar, textoboton, entidad ,
        
        //  Errores y Validaciones
        errorsZod, errorGenerico,
        
        //  Manejadores de Eventos
        handleChangeBuscador, handleCancelar, handleSubmit,
        handleChangeFormulario, handleAgragar, handleEstado,
        handlePaginaCambiada, handleModificar, handleEliminar,
        handleCancelarEliminar, handleSubmitEliminar  
    } = useAbmNivelUsuarios();


    const inputsModificar = inputsFormulario.map( (input) => {
        if ( tipoFormulario === "modificar" && input.name === "id" ) {
            return { ...input, readonly: true };
        }
        return input;
    });

    

return(
     <AmbVistas
            // PROPS DE FORMULARIO Y MODAL ===
            modal={modal}
            modalEliminar={modalEliminar}
            tipoFormulario={tipoFormulario}
            entidad={entidad}
            // Lógica para elegir qué inputs mostrar
            inputsEntidad={
                tipoFormulario === 'alta' ? inputsFormulario : inputsModificar
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