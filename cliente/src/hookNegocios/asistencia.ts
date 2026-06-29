
import { useAsistenciaLogica } from "../hooks/asistencia";
//Seccion de servicios--------------------------------------
import { asistenciaHorarios, registroAsistencia, obtenerDataAsistencia } from "../servicio/asistencia.fetch";


export const useAsistenciaSet = () =>{
 
    
    const config = {
        //nombre_escuela : rol. , declarar en login el nombre de la esucela 
        servicios : {
            asistenciaHorarios : asistenciaHorarios,
            registroAsistencia : registroAsistencia,
            obtenerDataAsistencia : obtenerDataAsistencia 
        },

        inicalFiltroAlumno :{
            dni_alumno : ""
        }
    };

    return useAsistenciaLogica(config);
};