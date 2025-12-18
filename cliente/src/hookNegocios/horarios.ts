
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

import {type Horas , type DiaSemana } from "../tipadosTs/horario";

const HORARIOS : Horas[] = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00"
];

const DIAS_SEMANA : DiaSemana[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
];




export const useHorariosUsuarios = () => {
    const { rol } = useContext( RutasProtegidasContext );

    const config = {
        idEscuela:  rol?.escuela || 1 ,

        servicios : {
            listadoTipo : listadoTipoSinPaginacion,
            listadoNivel : listadoNivelSinPaginacion,
            listadoProfesores : listadoProfesoresSinPag,
            HORARIOS , 
            DIAS_SEMANA,
        },

        inicialFiltroProfesor : {
            dni : ""
        },

        inicialFiltroNivel : {
           nivel : ""
        },

        inicialFiltroTipo : {
            tipo : ""
        },

        dataAltaHorario : {

        },

    };

    
return useHorarioHook( config )
}