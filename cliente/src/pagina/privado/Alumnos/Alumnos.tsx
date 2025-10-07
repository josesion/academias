// ===================================
//  SECCIÓN : IMPORTACIONES
// (Componentes de UI y Hooks de Lógica)
// ===================================
import { AmbVistas } from "../../../componentes/AbmVista/AbmVista";
import { useAbmAlumnos } from "../../../hookNegocios/abmAlumnos";


// ===================================
// COMPONENTE PRINCIPAL
// ===================================
export const AmbAlumnos = () => {

    //  Desestructuración del Custom Hook (Lógica de Negocio)
    const { 
        //  Estados y Datos
        inputsFiltro, inputsFormulario, estados, dataListado,
        modal, modalEliminar, formData, barraPaginacion,
        carga, estadoListado, filtroData, tipoFormulario,
        accionEliminar, textoboton,
        
        //  Errores y Validaciones
        errorsZod, errorGenerico,
        
        //  Manejadores de Eventos
        handleChangeBuscador, handleCancelar, handleSubmit,
        handleChangeFormulario, handleAgragar, handleEstado,
        handlePaginaCambiada, handleModificar, handleEliminar,
        handleCancelarEliminar, handleSubmitEliminar
    } = useAbmAlumnos();

    //  Lógica específica del componente (Manipulación del input 'dni')
    // Se ejecuta para hacer el campo 'dni' de solo lectura si estamos modificando.
    const inputsModificar = inputsFormulario.map( (input) => {
        if ( tipoFormulario === "modificar" && input.name === "dni" ) {
            return { ...input, readonly: true };
        }
        return input;
    });

    //  Renderizado (Paso de props al componente de Vista)
    return(
        <AmbVistas
            // PROPS DE FORMULARIO Y MODAL ===
            modal={modal}
            modalEliminar={modalEliminar}
            tipoFormulario={tipoFormulario}
            
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
    )
};