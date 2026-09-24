import { useReducer } from "react";

import { PlanesSassReducer, initialPlanesEscuelas } from "../../reducers/planes.saas.reducer";
import type {  CampoPlanKey, CampoClaveValorKey} from "../../reducers/planes.saas.reducer";
import type { CuerpoPlanes, PlanSaasRow, FiltroPlanes } from "../../servicio/administrador.fetch";
import type { PlanSaasItem } from "../../componentes/Administrador/ListadoPlanesSaas/ListadoPlanes";

import {type PlanesSassAction } from "../../reducers/planes.saas.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

export interface PlanesSaasProps {
    servicios : {
         postPlanesSaaas : ServicioCrud,
         getPlanSaas : ServicioCrud,
         putPlanesSaas : ServicioCrud
    }
}


export const PlanesSaasLogic = ( config : PlanesSaasProps) =>{

    const [ state, dispatch] = useReducer(PlanesSassReducer, initialPlanesEscuelas());

    //console.log(state.listadoPlan)


    const cachearFormulario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;  
        dispatch({
            type: "CAMBIAR_CAMPO",
            payload: {
                campo: name as CampoPlanKey,
                valor: value
            }
        });
    };

    const cachearCaracateristicas = (e: React.ChangeEvent<HTMLInputElement >) =>{
        const { name, value } = e.target;
        dispatch({
            type: "CAMBIAR_CLAVE_VALOR",
            payload: {
                campo: name as CampoClaveValorKey,
                valor: value
            }
        });
    };

    const agregarCaracteristica = () =>{
        const { clavesValor } = state;
 
        const valor = clavesValor.valor.value;
        const clave = clavesValor.clave.value;
    
        if ( !valor || !clave ){
            console.log(1)
        };

        dispatch({ type : "AGREGAR_CARACTERISTICA" , payload : { clave : clave, valor : valor }});
        dispatch({ type : "LIMPIAR_CLAVE_VALOR"});
    };

    const postPlanesSaas = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 1. Validamos que ningún input del formulario principal esté vacío
        const { formulario } = state;
        
        const nombreVacio = !formulario.nombre_plan.value.toString().trim();
        const tipoVacio = !formulario.tipo.value.toString().trim();
        const precioVacio = !formulario.precio_plan.value.toString().trim();
        const flayersVacio = !formulario.flayers_plan.value.toString().trim();

        if (nombreVacio || tipoVacio || precioVacio || flayersVacio) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Por favor, completa todos los campos del plan antes de guardar." 
            });
            return; // Cortamos la ejecución para que no haga el post
        }

        // 2. Opcional: Validar también que tenga al menos una característica si lo necesitás
        if (state.caracteristicas.length === 0) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Debes agregar al menos una característica al plan." 
            });
            return;
        }

        // Limpiamos errores previos si todo está bien
        dispatch({ type: "ERROR_POST", payload: null });

        try {
            dispatch({ type: "CARGA_POST", payload: true });


                const data : CuerpoPlanes  = {
                    descripcion : formulario.nombre_plan.value,
                    tipo : formulario.tipo.value,
                    precio : Number( formulario.precio_plan.value),
                    cant_flyers : Number( formulario.flayers_plan.value),
                    estado : "activo",
                    caracteristicas : state.caracteristicas
                }
            
            const postPlanes = config.servicios.postPlanesSaaas;
            const resultPostPlanes = await postPlanes(data);

            
            if ( resultPostPlanes.code === "PLAN_SAAS_OK"){
                 dispatch({ type : "LIMPIAR_TODO"});
                 return
            };

            dispatch({ 
                type: "ERROR_POST", 
                payload: resultPostPlanes.message
            }); 

            
        } catch (error) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Ocurrió un error al intentar guardar el plan." 
            });
        } finally {
            dispatch({ type: "CARGA_POST", payload: false });
        }
    };

    const cachearEditarPlan = (plan: PlanSaasItem) => {
        //console.log("Plan al que se le hizo clic:", plan);
        dispatch({ type: "CARGAR_PLAN_EDITAR", payload: plan }); 
        dispatch({ type : "SET_BOTONES_VISIBLES", payload : {modificar : true}});

    };

    const handleEditarPlan = async () =>{
        // 1. Validamos que ningún input del formulario principal esté vacío
        const { formulario } = state;
        
        const nombreVacio = !formulario.nombre_plan.value.toString().trim();
        const tipoVacio = !formulario.tipo.value.toString().trim();
        const precioVacio = !formulario.precio_plan.value.toString().trim();
        const flayersVacio = !formulario.flayers_plan.value.toString().trim();

        if (nombreVacio || tipoVacio || precioVacio || flayersVacio) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Por favor, completa todos los campos del plan antes de guardar." 
            });
            return; // Cortamos la ejecución para que no haga el post
        }

        // 2. Opcional: Validar también que tenga al menos una característica si lo necesitás
        if (state.caracteristicas.length === 0) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Debes agregar al menos una característica al plan." 
            });
            return;
        }   
             
        dispatch({ type: "ERROR_POST", payload: null });
    
        try {
            dispatch({ type: "CARGA_POST", payload: true });


                const data : CuerpoPlanes  = {
                    id : formulario.id,
                    descripcion : formulario.nombre_plan.value,
                    tipo : formulario.tipo.value,
                    precio : Number( formulario.precio_plan.value),
                    cant_flyers : Number( formulario.flayers_plan.value),
                    estado : "activo",
                    caracteristicas : state.caracteristicas
                }
            
            const putPlanes = config.servicios.putPlanesSaas;
            const resultPutPlanes = await putPlanes(data);
          
            if ( resultPutPlanes.code === "MOD_PLANES_SAAS_OK"){
                 dispatch({ type : "LIMPIAR_TODO"});
                 return
            };

            dispatch({ 
                type: "ERROR_POST", 
                payload: resultPutPlanes.message
            }); 

            
        } catch (error) {
            dispatch({ 
                type: "ERROR_POST", 
                payload: "Ocurrió un error al intentar guardar el plan." 
            });
        } finally {
            dispatch({ type: "CARGA_POST", payload: false });
        }

    };


    const data = {
        estado : "activo"
    };

    
    useEffectServicio< FiltroPlanes, PlanSaasRow[], PlanesSassAction>({
        servicios : config.servicios.getPlanSaas,
        dispatch : dispatch,
        valores : data,
        accionResultado : ( data ) => ({type : "SET_LISTADO_PLAN" , payload : data }),
        accionCarga : ( carga ) => ({ type : "CARGA_LISTADO" , payload : carga}),
        accionError : ( mensaje ) =>({ type : "ERROR_LISTADO" , payload : mensaje}),
        useAbort :true,
        dependencias : []
    });


    return{
        state, dispatch ,cachearFormulario,
        postPlanesSaas, cachearCaracateristicas,
        agregarCaracteristica, cachearEditarPlan,
        handleEditarPlan,
    }
};