
//------------------------------------------------------------------------//
import { useContext } from "react";

//------------------------------------------------------------------------//
import { useHorarioHook } from "../hooks/horarios";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";


// serviciosº--------------------------------------
import { listadoTipoSinPaginacion } from "../servicio/tipo.fetch";
import { listadoNivelSinPaginacion } from "../servicio/nivel.fetch";
import { listadoProfesoresSinPag } from "../servicio/profesor.usuarios";



export const useHorariosUsuarios = () => {
    const { rol } = useContext( RutasProtegidasContext );

    const config = {
        idEscuela:  rol?.escuela || 1 ,

        servicios : {
            listadoTipo : listadoTipoSinPaginacion,
            listadoNivel : listadoNivelSinPaginacion,
            listadoProfesores : listadoProfesoresSinPag
        },

        inicialFiltroProfesor : {
            dni : ""
        },

        inicialFiltroNivel : {
           nivel : ""
        },

        inicialFiltroTipo : {
            tipo : ""
        }

    };

    
return useHorarioHook( config )
}