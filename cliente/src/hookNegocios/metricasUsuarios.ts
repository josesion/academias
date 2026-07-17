import { metricasTajertas, metricasClase, metricasAsistencia  } from "../servicio/metrica.fetch";

import { metricasUsuarioLogica } from "../hooks/metricas/metricas.usuario";

export const  metricasUsuarioSeting = ( ) => {

    const config = {
        servicios : {
            tarjetas :  metricasTajertas,
            clases   :  metricasClase,
            asistencia : metricasAsistencia
        },


    };

   return metricasUsuarioLogica( config );

}; 