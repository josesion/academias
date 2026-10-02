import { EscuelasLogica } from "../hooks/Administrador/Esuelas";
import { postEscuelas, getEscuelas, putEscuelas, estadoEscuelas } from "../servicio/escuelas.fetch";

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