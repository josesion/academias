import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataPlanesSaas } from "../data/planes.saas.data";

import { TipadoData } from "../tipados/tipado.data";
import { ResultPostPlanesSass, PlanSaasConId, PlanDelet, PlanSaasRow } from "../data/planes.saas.data";
import { PlanDeletSaasInputs, PlanDeleteSaasSchema, PlanSaasInputs, PlanSaasSchema,
         FiltroPlanesInputs, FiltroPlanesSchema
 } from "../squemas/planes.saas";

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



const modPlanesSaas = async (data : PlanSaasInputs )
:Promise<TipadoData<PlanSaasConId>> =>{

    const validarData : PlanSaasInputs = PlanSaasSchema.parse( data );
    
    const resultModPlanes = await dataPlanesSaas.modPlanesSaas(validarData);

    if ( resultModPlanes.code === "ID_INVALIDO"){
        return {
            error : true, 
            message : resultModPlanes.message,
            code : resultModPlanes.code 
        };
    };

    if ( resultModPlanes.code === 'PLANES_SAAS_MODIFICAR'){
        return{
            error : false,
            message : "Plan modificado con exito.",
            code : "MOD_PLANES_SAAS_OK",
            data : resultModPlanes.data
        }
    };


    return{
        error : true, 
        message : "Error en el servidor , Planes Sass Mod.",
        code : "ERROR_SERVIDOR"
    }; 
};


const deletPlanesSaas = async (data : PlanSaasInputs )
:Promise<TipadoData<PlanDelet>> =>{

    const validarData : PlanDeletSaasInputs = PlanDeleteSaasSchema.parse( data );
  
    const resultDeletePlanes = await dataPlanesSaas.deletPlanesSaas(validarData);

    if ( resultDeletePlanes.code ===  'PLANES_SAAS_ELIMINAR'){
        return{
            error : false,
            message : "Plan eliminado con exito.",
            code : "DELETE_PLANES_SAAS_OK",
            data : resultDeletePlanes.data
        }
    };

    return{
        error : true, 
        message : "Error en el servidor , Planes Sass Mod.",
        code : "ERROR_SERVIDOR"
    }; 
};



const bajaPlanesSaas = async (data : PlanDeletSaasInputs )
:Promise<TipadoData<PlanDelet>> =>{

    const validarData : PlanDeletSaasInputs = PlanDeleteSaasSchema.parse( data );
  
    const resultDeletePlanes = await dataPlanesSaas.bajaPlanesSaas(validarData);

    if ( resultDeletePlanes.code ===  'PLANES_SAAS_MODIFICAR'){
        return{
            error : false,
            message : "Plan cambio de estado con exito.",
            code : "BAJA_PLANES_SAAS_OK",
            data : resultDeletePlanes.data
        }
    };

    return{
        error : true, 
        message : "Error en el servidor , Planes Sass dado de baja.",
        code : "ERROR_SERVIDOR"
    }; 
};


const listaPlanesSaas = async ( estado : FiltroPlanesInputs)
:Promise<TipadoData<PlanSaasRow[]>> =>{

    const validarEstado : FiltroPlanesInputs = FiltroPlanesSchema.parse(estado);

    const resultListaPlanesSaas = await dataPlanesSaas.listaPlanesSaas( validarEstado );
    
    console.log(resultListaPlanesSaas)

    if ( resultListaPlanesSaas.code === 'PLANES_SAAS_LISTED'){    
        return {
            error : false,
            message : "Listado de planes Administrativo ok.",
            code : "LISTA_PLANES_SAAS_OK",
            data : resultListaPlanesSaas.data
        };
    };

    if ( resultListaPlanesSaas.code === 'NO_ACTIVE_PLANES_SAAS'){    
        return {
            error : true,
            message : "Sin listado Administrativo.",
            code : "SIN_LISTA_PLANES",
        };
    };    
    
    return{
        error : true, 
        message : "Error en el servidor , Listado de planes.",
        code : "ERROR_SERVIDOR"
    }; 
};

export const method = {
    postPlanesSaas : tryCatchDatos( postPlanesSaas ),
    modPlanesSaas  : tryCatchDatos( modPlanesSaas),
    deletPlanesSaas : tryCatchDatos( deletPlanesSaas ),
    bajaPlanesSaas  : tryCatchDatos( bajaPlanesSaas ),
    listaPlanesSaas : tryCatchDatos( listaPlanesSaas)
};