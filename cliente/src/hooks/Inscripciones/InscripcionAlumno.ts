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
    /**
     * Busca al alumno en el listado por su correo electrónico.
     * El DNI se captura del objeto encontrado para enviarlo al backend,
     * pero la búsqueda se hace solo por email. Si el campo está vacío,
     * se resetea el alumno seleccionado.
     */
    const handleCachearAlumno = (e: React.ChangeEvent<HTMLInputElement>) =>{

        dispatch({type : "SET_FILTROS_ALUMNO", payload : {
            ...state.filtrosBusqueda.filtroBusquedaAlumno,
            pagina : 1 ,
            [e.target.name] : e.target.value
        }})

        const emailBuscado = e.target.value.trim();

        // Si el campo está vacío, resetear el alumno seleccionado
        if (emailBuscado === "") {
            dispatch({ type : "SET_ALUMNO" , payload : null});
            dispatch({ type : "SET_ERROR_GENERICO" , payload : null});
            return;
        }

        // Buscar alumno por email: match parcial (mientras escribes) o exacto
        const alumnoSeleccionado = state.listadoAlumno.find(
            alumno => (alumno.email || "").toLowerCase().includes(emailBuscado.toLowerCase())
        );

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
                    // Si hay filtro por email o apellido, usar búsqueda sin paginación
                    const filtroEmail = (state.filtrosBusqueda.filtroBusquedaAlumno as any).email || "";
                    const filtroApellido = (state.filtrosBusqueda.filtroBusquedaAlumno as any).apellido || "";

                    // Normaliza los datos del backend (Email, Dni, Nombre...) al formato del frontend (email, Dni, Nombre...)
                    const normalizarAlumno = (item: any) => ({
                        Dni: item.Dni || item.dni || undefined,
                        Nombre: item.Nombre || item.nombre || "",
                        Apellido: item.Apellido || item.apellido || "",
                        email: item.Email || item.email || ""
                    });

                    if (filtroEmail === "" && filtroApellido === ""){
                        // Sin filtro: listado paginado
                        const listado = await servicioApiFetch(state.filtrosBusqueda.filtroBusquedaAlumno, signal);

                        if( listado.error === false) {
                            dispatch({ type : "SET_LISTADO_ALUMNO", payload : listado.data.map(normalizarAlumno)});
                        };
                    } else {
                        // Con filtro: búsqueda sin paginación
                        const listadoFiltro = await servicioApiFetchSinPag(state.filtrosBusqueda.filtroBusquedaAlumno, signal);

                        if (listadoFiltro.error === false){
                            dispatch({type : "SET_LISTADO_ALUMNO" , payload : listadoFiltro.data.map(normalizarAlumno)});                    
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