
import { useEffect } from "react";
//hooks
import { peticiones } from "../../utils/peticiones";
//Reducer
import type { InscripcionTipado, InscripcionAcciones } from "../../reducers/inscripcionReducer";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface PlanesInscripciones {

     servicios :{
        listaPlanPaginado      : ServicioCrud,
        listadoPlanesBusqueda  : ServicioCrud,
     },
     state : InscripcionTipado,
     dispatch :  React.Dispatch<InscripcionAcciones>;
};


export const InscripcionPlan = ( config : PlanesInscripciones) => {

    const { state, dispatch} = config;


    // ──────────────────────────────────────────────────────────────
    // FUNCION para obtener los datos del plan q se clikea
    // ────────────────────────────────────────────────────────────── 
     const handleCachearPlan = (e: React.ChangeEvent<HTMLInputElement>) => {

        dispatch({type : "SET_FILTROS_PLAN", payload : {
            ...state.filtrosBusqueda.filtroBusquedaPlan,
            pagina : 1,
            [e.target.name] : e.target.value  
        }});

        const descripcionPlan = e.target.value;
        const planSeleccionado = state.listadoPlan.find( planes => planes.descripcion === descripcionPlan );

        if ( planSeleccionado) {
   
            dispatch({ type : "SET_PLAN" , payload : planSeleccionado});
        }else{
   
            dispatch({ type : "SET_PLAN" , payload : null});
        
            dispatch( { type : "SET_ERROR_GENERICO" , payload : null})

        };
    };

// ──────────────────────────────────────────────────────────────
// Listado de planes con paginacion y sin paginacion
// ──────────────────────────────────────────────────────────────
useEffect( () =>{
    const { signal, timeoutId, controlador} = peticiones({
        tiempo : 5,
        setErrorGenerico : (mensaje) => dispatch({ type: 'SET_ERROR_GENERICO', payload: mensaje }),
        setCarga: () => dispatch({ type: 'FINALIZAR_OPERACION' })
    });
    
    const listadoPlanesPaginado = async () => {
        const servicioApiFetch = config.servicios.listaPlanPaginado;
        const servicioApiFetchSinPag = config.servicios.listadoPlanesBusqueda;
        
            try{    

                if ( state.filtrosBusqueda.filtroBusquedaPlan.descripcion === ""){
                    const listadoP  = await servicioApiFetch( state.filtrosBusqueda.filtroBusquedaPlan , signal);
                
                    if ( listadoP.error === false) {
                        dispatch({type : "SET_LISTADO_PLAN" , payload : listadoP.data});
                    };
                }else{
                    const listadoFiltrado = await servicioApiFetchSinPag( state.filtrosBusqueda.filtroBusquedaPlan , signal);
                   
                    if ( listadoFiltrado.error === false) {
                        dispatch({type : "SET_LISTADO_PLAN", payload : listadoFiltrado.data});
                    }; 
                };

            }catch( error ){
                dispatch({ type : "SET_ERROR_GENERICO", payload : 'Ocurrió un error inesperado al cargar los datos Planes.'})
            }finally{
                clearTimeout(timeoutId);
                dispatch({type : "FINALIZAR_OPERACION"})
            };

    };

    listadoPlanesPaginado();

    return() => {
        controlador.abort();
        clearTimeout(timeoutId);
    }

},[state.filtrosBusqueda.filtroBusquedaPlan, state.actualizarListado]);    
  
    return { handleCachearPlan, }
};