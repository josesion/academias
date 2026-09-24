import { PlanesSaasLogic } from "../hooks/Administrador/Planes.saas";
import { postPlanesSaaas, getPlanSaas, putPlanesSaas } from "../servicio/administrador.fetch";


export const setAbmPlanes = () =>{

      const  config = {         
            servicios : {
                postPlanesSaaas : postPlanesSaaas,
                getPlanSaas  : getPlanSaas,
                putPlanesSaas : putPlanesSaas,
            } 
        };
    return PlanesSaasLogic(config);    

};