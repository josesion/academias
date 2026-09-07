import { useContext} from "react";
import { RutasProtegidasContext } from "../contexto/protectRutas";

import { alumnosEscuelas } from "../servicio/principal.alumnos.fetch"; 
import { metricasAlumnos } from "../hooks/SeccionAlumnos/MetricasAlumnos";

export const configMetricasAlumnos = ()=>{
        const { rol } = useContext(RutasProtegidasContext);

    const config ={
        usuario : rol?.usuario ? rol.usuario : "users",
        servicios :{
            alumnosEscuelas : alumnosEscuelas
        },

    };

    return metricasAlumnos(config)
};