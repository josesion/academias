import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataPlanesSaas } from "../data/planes.saas.data";

import { TipadoData } from "../tipados/tipado.data";
import { ResultPostPlanesSass } from "../data/planes.saas.data";
import { PlanSaasInputs, PlanSaasSchema } from "../squemas/planes.saas";

const postPlanesSaas = async ( data : PlanSaasInputs)
:Promise<TipadoData<ResultPostPlanesSass>> =>{

    const validarData : PlanSaasInputs = PlanSaasSchema.parse( data );
    const resultPostPlanes  = await dataPlanesSaas.postPlanesSaas( validarData);
  
    
    if ( resultPostPlanes.code === "PLANES_SAAS_CREAR") {
        return {
            error : false, 
            message : "Plan Administrativo creado.",
            code : "PLAN_SAAS_OK",
            data : resultPostPlanes.data
        };
    };

    return{
        error : true, 
        message : "Error en el servidor , Planes Sass post.",
        code : "ERROR_SERVIDOR"
    }; 

};

export const method = {
    postPlanesSaas : tryCatchDatos( postPlanesSaas ),
}