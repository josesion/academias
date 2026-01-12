import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useAsistenciaLogica } from "../hooks/asistencia";
//Seccion de servicios--------------------------------------
import { asistenciaHorarios } from "../servicio/asistencia.fetch";


export const useAsistenciaSet = () =>{
    const { rol } = useContext( RutasProtegidasContext );
    
    const config = {
        id_escuela :rol?.escuela || 1 ,
        //nombre_escuela : rol. , declarar en login el nombre de la esucela 
        servicios : {
            asistenciaHorarios : asistenciaHorarios
        },

        inicalFiltroAlumno :{
            dni : ""
        }
    };

    return useAsistenciaLogica(config);
};