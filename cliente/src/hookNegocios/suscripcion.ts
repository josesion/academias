import { getEscuelas, postSusp, getEscPlanes, putEstadoSuspc, metricasSuspcripcion } from "../servicio/suspcripciones.fetch";
import { listaLogs, putLogs } from "../servicio/logs.fetch";
import { SuscripcionesLogica } from "../hooks/Administrador/Suspcripciones";

export const setAbmSuspcripciones = () =>{

    const config = {
        servicios : {
            getEscuelas, postSusp, getEscPlanes, putEstadoSuspc, metricasSuspcripcion,
            // bitácora del sistema (bloque 6 del reducer)
            listaLogs, putLogs
        }
    }


    return SuscripcionesLogica( config );
};