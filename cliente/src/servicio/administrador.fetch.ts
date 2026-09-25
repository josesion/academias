import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


export interface ResultPostPlanesSass {
    descripcion : string, 
    tipo : string,
};


export interface InputPlanField {
  nombre: string;
  value: string ;
}

export interface PlanFormState {
  id? : number;  
  nombre_plan: InputPlanField;
  tipo: InputPlanField;
  precio_plan: InputPlanField;
  flayers_plan: InputPlanField;
  estado : string; 
}

export interface ClaveValorForm {
    clave : InputPlanField,
    valor : InputPlanField
};

export interface Caracteristica {
  clave: string;
  valor: string | number;
}

export interface CuerpoPlanes {
    id?: number;
    descripcion: string;
    tipo: string;
    precio: number;
    cant_flyers: number;
    estado: string;
    caracteristicas: Caracteristica[]; 
};

export const postPlanesSaaas = async( parametro : CuerpoPlanes ) 
    :Promise<ApiResponse<ResultPostPlanesSass>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    


    const ruta  = `${PAGINA}api/planes_sass`;
    return await apiFetch( ruta , {
        method : "POST",
        body :{
            descripcion: parametro.descripcion,
            tipo: parametro.tipo,
            precio: parametro.precio,
            cant_flyers: parametro.cant_flyers,
            estado: parametro.estado,
            caracteristicas: parametro.caracteristicas          
        }
    });
}


export interface FiltroPlanes {
    estado : string;
};

export interface PlanSaasRow {
    id_plan: number;
    tipo: 'basico' | 'intermedio' | 'premium';
    descripcion: string;
    precio: number;
    cant_flyers: number;
    caracteristicas: any; // O podés tiparlo con la estructura exacta del objeto si lo preferís
    estado: 'activo' | 'inactivo';
};

export const getPlanSaas = async( parametro : FiltroPlanes ) 
    :Promise<ApiResponse<PlanSaasRow[]>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    


    const ruta  = `${PAGINA}api/lista_planes_saas/${parametro.estado}`;
    return await apiFetch( ruta , {
        method : "GET"
    });
}



export interface ResultPostPlanesSass {
    descripcion : string, 
    tipo : string,
    id_plan : number
};

export const putPlanesSaas  = async( parametro : CuerpoPlanes ) 
    :Promise<ApiResponse<ResultPostPlanesSass>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    


    const ruta  = `${PAGINA}api/mod_planes_saas/${parametro.id}`;
    return await apiFetch( ruta , {
        method : "PUT",
        body : {
            descripcion: parametro.descripcion,
            tipo: parametro.tipo,
            precio: parametro.precio,
            cant_flyers: parametro.cant_flyers,
            estado: parametro.estado,
            caracteristicas: parametro.caracteristicas      
        }
    });
}


export interface PlanDelet {
    id_plan : number
};

export interface PlanSeleccionado {
    id_plan: number | null;
    estado: string | null;
}

export const estadoPlanes = async ( parametro : PlanSeleccionado)
:Promise<ApiResponse<PlanDelet>> =>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }     

     const ruta  = `${PAGINA}api/baja_planes_saas/${parametro.id_plan}/${parametro.estado}`;
    return await apiFetch( ruta , {
        method : "PUT"
    });   

};