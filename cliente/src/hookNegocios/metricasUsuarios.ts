import { metricasTajertas, metricasClase, metricasAsistencia  } from "../servicio/metrica.fetch";
import { getHistorialMetrica } from "../servicio/historial.fetch";

import { metricasUsuarioLogica } from "../hooks/metricas/metricas.usuario";

export const  metricasUsuarioSeting = ( ) => {

    const config = {
        servicios : {
            tarjetas :  metricasTajertas,
            clases   :  metricasClase,
            asistencia : metricasAsistencia,
            historial  : getHistorialMetrica,
        },


    };

   return metricasUsuarioLogica( config );

}; 