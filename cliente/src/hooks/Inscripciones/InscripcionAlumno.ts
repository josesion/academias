import { useEffect } from "react";
//hooks
import { peticiones } from "../../utils/peticiones";
//Reducer
import type { InscripcionTipado, InscripcionAcciones } from "../../reducers/inscripcionReducer";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface AlumnoInscripciones {

     servicios :{
        listaAlumnosPaginado    : ServicioCrud,
        listadoAlumnosBusqueda  : ServicioCrud,
     },
     state : InscripcionTipado,
     dispatch :  React.Dispatch<InscripcionAcciones>;
};


export const InscripcionAlumno = ( config : AlumnoInscripciones ) => {

    const { state , dispatch} = config;

    // ──────────────────────────────────────────────────────────────
    // Funcion para obtener los datos del alumno que se seleccione
    // ──────────────────────────────────────────────────────────────
    const handleCachearAlumno = (e: React.ChangeEvent<HTMLInputElement>) =>{

        dispatch({type : "SET_FILTROS_ALUMNO", payload : {
            ...state.filtrosBusqueda.filtroBusquedaAlumno,
            pagina : 1 ,
            [e.target.name] : e.target.value
        }})

        const dniAlumno = e.target.value;

        const alumnoSeleccionado = state.listadoAlumno.find( alumno => String(alumno.Dni) === dniAlumno );

        if (alumnoSeleccionado){
   
            dispatch({type :"SET_ALUMNO", payload : alumnoSeleccionado});
        }else{

            dispatch({ type : "SET_ALUMNO" , payload : null});
            dispatch( { type : "SET_ERROR_GENERICO" , payload : null})

        };
    };
    
    
    // ──────────────────────────────────────────────────────────────
    // Listado de alumnos  con paginacion y sin paginacion  
    // ──────────────────────────────────────────────────────────────
    useEffect(()=>{
            const { signal, timeoutId, controlador} = peticiones({
                tiempo : 5,
                setErrorGenerico : (mensaje) => dispatch({ type: 'SET_ERROR_GENERICO', payload: mensaje }),
                setCarga: () => dispatch({ type: 'FINALIZAR_OPERACION' })
            });
        const listadoAlumnoPaginacion = async() => {

            const servicioApiFetch = config.servicios.listaAlumnosPaginado;
            const servicioApiFetchSinPag = config.servicios.listadoAlumnosBusqueda;
            
                try{
                    if (state.filtrosBusqueda.filtroBusquedaAlumno.dni === ""){    
                        const listado = await servicioApiFetch(state.filtrosBusqueda.filtroBusquedaAlumno, signal);
            
                        if( listado.error === false) {
                            dispatch({ type : "SET_LISTADO_ALUMNO", payload : listado.data});
                        };
                    }else{
                        const listadoFiltro = await servicioApiFetchSinPag(state.filtrosBusqueda.filtroBusquedaAlumno, signal);
                    
                        if (listadoFiltro.error === false){
                            dispatch({type : "SET_LISTADO_ALUMNO" , payload : listadoFiltro.data});                    
                        };
                    };

                }catch( error ){
                    dispatch({ type: 'SET_ERROR_GENERICO', payload: 'Ocurrió un error inesperado  donde esal cargar los datos Alumnmos.' })
                }finally{
                    clearTimeout(timeoutId);
                    dispatch({ type: "FINALIZAR_OPERACION"})
                }
            };

            listadoAlumnoPaginacion();    

            return () =>{
                controlador.abort();
                clearTimeout(timeoutId);
            };

    },[state.filtrosBusqueda.filtroBusquedaAlumno, state.actualizarListado]);   


    return { handleCachearAlumno, };

};