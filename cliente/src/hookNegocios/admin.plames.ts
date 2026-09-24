import { PlanesSaasLogic } from "../hooks/Administrador/Planes.saas";
import { postPlanesSaaas, getPlanSaas } from "../servicio/administrador.fetch";


export const setAbmPlanes = () =>{

      const  config = {         
            servicios : {
                postPlanesSaaas : postPlanesSaaas,
                getPlanSaas  : getPlanSaas
            } 
        };
    return PlanesSaasLogic(config);    

};