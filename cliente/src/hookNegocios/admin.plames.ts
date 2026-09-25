import { PlanesSaasLogic } from "../hooks/Administrador/Planes.saas";
import { postPlanesSaaas, getPlanSaas, putPlanesSaas, estadoPlanes } from "../servicio/administrador.fetch";


export const setAbmPlanes = () =>{

      const  config = {         
            servicios : {
                postPlanesSaaas : postPlanesSaaas,
                getPlanSaas  : getPlanSaas,
                putPlanesSaas : putPlanesSaas,
                estadoPlanes  : estadoPlanes,
            } 
        };
    return PlanesSaasLogic(config);    

};