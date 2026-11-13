import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataPlanesSaas } from "../data/planes.saas.data";

import { TipadoData } from "../tipados/tipado.data";
import { ResultPostPlanesSass, PlanSaasConId, PlanDelet, PlanSaasRow } from "../data/planes.saas.data";
import { PlanDeletSaasInputs, PlanDeleteSaasSchema, PlanSaasInputs, PlanSaasSchema,
         FiltroPlanesInputs, FiltroPlanesSchema,
         PlanEstadoSaasInputs, PlanEstadoSaasSchema
 } from "../squemas/planes.saas";

/**
 * Crea un nuevo plan SaaS con la información validada por el esquema.
 *
 * @param data - Datos del plan a registrar.
 * @returns Respuesta tipada con el resultado de la creación del plan.
 */
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



/**
 * Modifica un plan SaaS existente validando el payload antes del update.
 *
 * @param data - Datos del plan a actualizar.
 * @returns Respuesta tipada con el plan actualizado o el detalle del error.
 */
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


/**
 * Elimina un plan SaaS usando el esquema específico de borrado.
 *
 * @param data - Identificador y datos requeridos para eliminar el plan.
 * @returns Respuesta tipada confirmando la eliminación o el error generado.
 */
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



/**
 * Alterna el estado de un plan SaaS entre activo e inactivo.
 *
 * @param data - Identificador del plan y estado actual para invertirlo.
 * @returns Respuesta tipada con el nuevo estado del plan o el error asociado.
 */
const bajaPlanesSaas = async (data : PlanEstadoSaasInputs )
:Promise<TipadoData<PlanDelet>> =>{

    const validarData : PlanEstadoSaasInputs = PlanEstadoSaasSchema.parse( data );
    const nuevoEstado = validarData.estado === 'activo' ? 'inactivo' : 'activo';

    const resultDeletePlanes = await dataPlanesSaas.bajaPlanesSaas({
        id_plan: validarData.id_plan,
        estado: nuevoEstado
    });

    if ( resultDeletePlanes.code ===  'PLANES_SAAS_MODIFICAR'){
        return{
            error : false,
            message : `Plan actualizado a ${nuevoEstado} con exito.`,
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


/**
 * Obtiene el listado de planes SaaS según el filtro de estado enviado.
 *
 * @param estado - Filtro que determina si se listan los planes activos, inactivos o todos.
 * @returns Respuesta tipada con el conjunto de planes o el estado vacío/error.
 */
const listaPlanesSaas = async ( estado : FiltroPlanesInputs)
:Promise<TipadoData<PlanSaasRow[]>> =>{

    const validarEstado : FiltroPlanesInputs = FiltroPlanesSchema.parse(estado);

    const resultListaPlanesSaas = await dataPlanesSaas.listaPlanesSaas( validarEstado );
    
  

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

/**
 * Colección de métodos del servicio para gestionar planes SaaS.
 *
 * Incluye creación, modificación, eliminación, activación/inactivación y listado.
 */
export const method = {
    postPlanesSaas : tryCatchDatos( postPlanesSaas ),
    modPlanesSaas  : tryCatchDatos( modPlanesSaas),
    deletPlanesSaas : tryCatchDatos( deletPlanesSaas ),
    bajaPlanesSaas  : tryCatchDatos( bajaPlanesSaas ),
    listaPlanesSaas : tryCatchDatos( listaPlanesSaas)
};