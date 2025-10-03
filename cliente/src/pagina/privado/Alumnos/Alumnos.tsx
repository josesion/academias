
// seccion Componentes
import { AmbVistas } from "../../../componentes/AbmVista/AbmVista";

// Seccion de hook negocios
import { useAbmAlumnos } from "../../../hookNegocios/abmAlumnos";



export const AmbAlumnos = () =>{
const { 
        inputsFiltro, inputsAlumnos,estados,
        modal, modalEliminar ,errorsZod, errorGenerico, dataAlumnosListado, 
        formData, barraPaginacion,carga ,estadoListado ,filtroData ,
        tipoFormulario,
        handleChangeBuscador, handleCancelar,
        handleSubmit, handleSubmitModificar,handleChangeFormulario, 
        handleAgragar, handleEstado, handlePaginaCambiada,
        handleModificar, handleEliminar  
} = useAbmAlumnos();


    const inputsModificar = inputsAlumnos.map( (input) => {
        if ( tipoFormulario === "modificar" && input.name === "dni" ) {
            return { ...input, readonly: true };
        }
        return input;
    });
    return(
        <AmbVistas
            modal={modal}
            modalEliminar = {modalEliminar}

            tipoFormulario={tipoFormulario}
            inputsEntidad={
                tipoFormulario === 'alta' ? inputsAlumnos
                : inputsModificar
            }
            formData={formData}
            errorsZod={errorsZod}
            errorGenerico={errorGenerico}
            onHandleCancelar={handleCancelar}
            onHandleChangeFormulario={handleChangeFormulario}
            onHandleSubmit={
                tipoFormulario === "alta" ?  handleSubmit
                : handleSubmitModificar
            }

            inputsFiltro={inputsFiltro}
            filtroData={filtroData}
            estados={estados}
            onHandleChangeBuscador={handleChangeBuscador}
            onHandleAgregar={handleAgragar}
            onHandleEstado={handleEstado}

            carga={carga}
            error={estadoListado.error}
            onEliminar={handleEliminar}
            onModificar={handleModificar}

            statuscode={estadoListado.statuscode}
            barraPaginacion={barraPaginacion}
            dataAlumnosListado={dataAlumnosListado}
            onHandlePaginaCambiada={handlePaginaCambiada}


        />
    )
};