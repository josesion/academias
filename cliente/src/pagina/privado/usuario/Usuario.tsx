import { useState } from "react";

import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";

import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";


import "./usuario.css";


export const UsuarioPage = () =>{

 const   {  plan , alumno, errorGenerico,modalInsc,
            listadoPlan,  listadoAlumno,  
            handleCachearPlan, handleCachearAlumno,
            handleInscribir , handleCancelar
        } = useIncripcionesUsuarios();

console.log( modalInsc)

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


        </div>
    )
}