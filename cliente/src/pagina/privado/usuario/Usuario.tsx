
import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";
import { FormHorario } from "../../../componentes/FormularioHorario/FormHorario";


import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";
import { useHorariosUsuarios } from "../../../hookNegocios/horarios";


import "./usuario.css";


export const UsuarioPage = () =>{

 const  {  plan , alumno, errorGenerico,modalInsc,
            listadoPlan,  listadoAlumno,  
            handleCachearPlan, handleCachearAlumno,
            handleInscribir , handleCancelar
        } = useIncripcionesUsuarios();

 const { profesores, niveles, tipo, modalInterno,
         listaProfe, listaNiveles, listaTipo,
         handleCachearProfesores, handleCachearNiveles , handleCachearTipos,
         handleModHorariosData , hanldeAltaHorariosData,
         horarios, diasSemana,  
       } = useHorariosUsuarios();

    return(
        <div className="usuario_contenedor">
            {
                modalInsc &&
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
            }

            <div>
                <FormHorario
                    diasSemana={diasSemana}
                    horarios={horarios}
                    
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


                    handleMod={handleModHorariosData}
                    handleAlta={hanldeAltaHorariosData}
                />
            </div>


        </div>
    )
}