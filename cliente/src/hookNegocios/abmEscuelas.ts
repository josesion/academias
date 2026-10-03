import { EscuelasLogica } from "../hooks/Administrador/Esuelas";
import { postEscuelas, getEscuelas, putEscuelas, estadoEscuelas } from "../servicio/escuelas.fetch";
import type { InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador";



export const setAmbEscuelas = () =>{

    

    const config = {


        
        servicios : {
            postEscuelas : postEscuelas,
            getEscuelas : getEscuelas,
            putEscuelas : putEscuelas,
            estadoEscuelas : estadoEscuelas
        }
    }

    return EscuelasLogica(config)

};