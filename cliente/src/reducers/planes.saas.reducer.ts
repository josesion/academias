import type { ClaveValorForm, PlanFormState, PlanSaasRow } from "../servicio/administrador.fetch";
import { type Caracteristica } from "../servicio/administrador.fetch";
import {type PlanSaasItem } from "../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";

export interface PlanesSassTipado {
    carga : { 
        post : boolean,
        listado : boolean,
    },

    error : {
        post : string | null,
        listado : string | null,
    },

    formulario: PlanFormState;
    clavesValor: ClaveValorForm;
    caracteristicas: Caracteristica[];
    listadoPlan : PlanSaasRow[] | null;

};

export const initialPlanesEscuelas = (): PlanesSassTipado => ({

    carga : {
        post : false, 
        listado : false,    
    },

    error : {
        post : null,  
        listado :  null,
    },

    formulario: {
        nombre_plan: {
            nombre: "nombre_plan",
            value: "",
        },
        tipo: {
            nombre: "tipo",
            value: "", 
        },
        precio_plan: {
            nombre: "precio_plan",
            value: "",
        },
        flayers_plan: {
            nombre: "flayers_plan",
            value: "",
        },
        estado: "activo", 
    },   
    clavesValor: {
        clave: {
            nombre: "clave",
            value: ""
        },
        valor: {
            nombre: "valor",
            value: ""
        }
    },
    caracteristicas: [],
    listadoPlan : null,

});

// Tipos para las llaves del formulario y de clavesValor
export type CampoPlanKey = keyof Omit<PlanFormState, 'id' | 'estado'>;
export type CampoClaveValorKey = keyof ClaveValorForm;

export type PlanesSassAction = 
    | { type: "CARGA_POST", payload : boolean }    
    | { type: "ERROR_POST" , payload : string | null }
  
    | { type: "CARGA_LISTADO", payload : boolean }    
    | { type: "ERROR_LISTADO" , payload : string | null }    
    
    | { type: "CAMBIAR_CAMPO"; payload: { campo: CampoPlanKey; valor: string | number } }
    | { type: "SET_ID"; payload: number | null }
    | { type: "CAMBIAR_CLAVE_VALOR"; payload: { campo: CampoClaveValorKey; valor: string } }
    | { type: "LIMPIAR_CLAVE_VALOR" }
    | { type: "AGREGAR_CARACTERISTICA"; payload: Caracteristica }
    | { type: "ELIMINAR_CARACTERISTICA"; payload: string }
    | { type : "SET_LISTADO_PLAN", payload : PlanSaasRow[] | null}
    | { type: "CARGAR_PLAN_EDITAR"; payload: PlanSaasItem }

    | { type: "LIMPIAR_TODO" };

export const PlanesSassReducer = ( 
    state: ReturnType<typeof initialPlanesEscuelas>, 
    action: PlanesSassAction
): ReturnType<typeof initialPlanesEscuelas> => {

    switch (action.type) {
        case "CARGAR_PLAN_EDITAR": {
            const plan = action.payload;
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    id: plan.id_plan,
                    nombre_plan: { ...state.formulario.nombre_plan, value: plan.descripcion },
                    tipo: { ...state.formulario.tipo, value: plan.tipo },
                    precio_plan: { ...state.formulario.precio_plan, value: String(plan.precio) },
                    flayers_plan: { ...state.formulario.flayers_plan, value: String(plan.cant_flyers) },
                    estado: plan.estado,
                }
            };
        }

        case "CARGA_POST" :
            return {
                ...state,
                carga :{
                    ...state.carga,
                    post : action.payload
                }
            }

        case "ERROR_POST" :
            return {
                ...state, 
                error : {
                    ...state.error,
                    post : action.payload
                }
            } 
            
        case "CARGA_LISTADO" :
            return {
                ...state,
                carga :{
                    ...state.carga,
                    listado : action.payload
                }
            }

        case "ERROR_LISTADO" :
            return {
                ...state, 
                error : {
                    ...state.error,
                    listado : action.payload
                }
            }              


        case "CAMBIAR_CAMPO": {
            const { campo, valor } = action.payload;
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [campo]: {
                        ...state.formulario[campo],
                        value: valor,
                    },
                },
            };
        }

        case "SET_ID":
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    id: action.payload ?? undefined,
                },
            };

        case "CAMBIAR_CLAVE_VALOR": {
            const { campo, valor } = action.payload;
            return {
                ...state,
                clavesValor: {
                    ...state.clavesValor,
                    [campo]: {
                        ...state.clavesValor[campo],
                        value: valor,
                    },
                },
            };
        }   

        case "LIMPIAR_CLAVE_VALOR":
            return {
                ...state,
                clavesValor: {
                    clave: {
                        ...state.clavesValor.clave,
                        value: ""
                    },
                    valor: {
                        ...state.clavesValor.valor,
                        value: ""
                    }
                }
            };

        case "AGREGAR_CARACTERISTICA":
            return {
                ...state,
                caracteristicas: [...state.caracteristicas, action.payload]
            };

        case "ELIMINAR_CARACTERISTICA":
            return {
                ...state,
                caracteristicas: state.caracteristicas.filter(c => c.clave !== action.payload)
            };

        case "SET_LISTADO_PLAN" :
            return {
                ...state,
                listadoPlan : action.payload
            };  
            
  

        case "LIMPIAR_TODO":
            return initialPlanesEscuelas()            

        default:
            return state;            
    }
};