import { InscripcionForm } from "../../../componentes/FormInscripcion/Inscripcion";

import { useIncripcionesUsuarios } from "../../../hookNegocios/Inscripciones";


import "./usuario.css";


export const UsuarioPage = () =>{

 const   {  plan , alumno,
            listadoPlan,  listadoAlumno,  
            handleCachearPlan, handleCachearAlumno,
            handleInscribir , handleCancelar
        } = useIncripcionesUsuarios();

    return(
        <div className="usuario_contenedor">
            <InscripcionForm
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
    )
}