import { getEscuelas, postSusp, getEscPlanes, putEstadoSuspc, metricasSuspcripcion } from "../servicio/suspcripciones.fetch";
import { SuscripcionesLogica } from "../hooks/Administrador/Suspcripciones";

export const setAbmSuspcripciones = () =>{

    const config = {
        servicios : {
            getEscuelas, postSusp, getEscPlanes, putEstadoSuspc, metricasSuspcripcion
        }
    }


    return SuscripcionesLogica( config );
};