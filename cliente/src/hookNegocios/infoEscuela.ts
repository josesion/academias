import { useContext} from "react";
import { RutasProtegidasContext } from "../contexto/protectRutas";

import { alumnosEscuelas, dataEscuela, horarioEscuela } from "../servicio/principal.alumnos.fetch"; 
import { infoEscuelas } from "../hooks/SeccionAlumnos/InfoEscuelas";

export const configInfoEscuelas = ()=>{
        const { rol } = useContext(RutasProtegidasContext);

    const config ={
        usuario : rol?.usuario ? rol.usuario : "users",
        servicios :{
            alumnosEscuelas : alumnosEscuelas,
            dataEscuela     : dataEscuela,
            horarioEscuela  : horarioEscuela,
        },

    };

    return infoEscuelas(config)
};