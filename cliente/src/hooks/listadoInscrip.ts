import { useState, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { ListadoInscripcionReducer, inicialState } from "../reducers/ListadoInscripcion";



import { peticiones } from "../utils/peticiones";

import { type FiltroBusqueda } from "../tipadosTs/inscripciones"; 
import { type PaginacionProps } from "../tipadosTs/genericos";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface InscripcionConfig{

    servicios : {
        listado : ServicioCrud,
        anulacion : ServicioCrud,
    },

    estados: string[] ; 
    inputsFiltros: any[];
    inicialFiltros : any;
    paginacion :  PaginacionProps
};



export const listaInscripcionLogica = ( config : InscripcionConfig ) => {

 const irA = useNavigate();   

 const [ state , dispatch] = useReducer(ListadoInscripcionReducer, inicialState({
     inicialFiltrosBusqueda : config.inicialFiltros,
     paginacion : config.paginacion
 }));  


 const abrirInscribir = () =>{
    irA("/inscrip_page");
 };

////////////////////////////////////////////////////////////////////////////////
//
//  SECCION PARA LOS FILTROS DE BUSQUEDA 
//
///////////////////////////////////////////////////////////////////////////////



//--------------------- HANDLES FILTROS PAGINACION ---------------------------------
    const handlePaginaCambiada = (pagina: number) => {

        dispatch({ type : "SET_FILTRO_DATA" , payload : {
            ...state.filtroData,
            pagina : pagina
        }})
    };



//--------------------- HANDLES FILTROS BUSQUEDA ---------------------------------   
    const handleChangaValue = (event: React.ChangeEvent<HTMLInputElement>) => {

        dispatch({ type : "SET_FILTRO_DATA" , payload :  {
            ...state.filtroData,
             [event.target.name] : event.target.value,
             pagina : 1
        }})


    };
    const handleChangeEstado = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = event.target.value as FiltroBusqueda['estado']; 

         dispatch({ type : "SET_FILTRO_DATA" , payload :  {
             ...state.filtroData,
             estado : nuevoEstado ,
             pagina : 1
         }})

    };

    const handleChangeFechaDesde = ( event: React.ChangeEvent<HTMLInputElement>) => {
  
        dispatch({ type : "SET_FILTRO_DATA" , payload : {
            ...state.filtroData,
            fecha_desde : event.target.value,
            pagina : 1
        }})        
    };
    const handleChangeFechaHasta = ( event: React.ChangeEvent<HTMLInputElement>) => {

        dispatch({ type : "SET_FILTRO_DATA" , payload : {
            ...state.filtroData,
            fecha_hasta : event.target.value,
            pagina : 1
        }})
    };    

////////////////////////////////////////////////////////////////////////////////
//
//  Anular la inscripcion
//
/////////////////////////////////////////////////////////////////////////////// 
  interface dataAnular {
    modalAnular: boolean;
    idInscripcion: number | null;
    metodo_pago : string,
    monto_pagado : string,
    carga: boolean  ;
    texto: string  ;
    mensajeError : string
  }

const [ dataAnularInscripcion , setDataAnularInscripcion ] = useState<dataAnular>({
    modalAnular : false,
    idInscripcion : null,
    metodo_pago : "",
    monto_pagado : "",
    carga : false,
    texto : "",
    mensajeError : ""
});

//const [ actualizarListado , setActualizarListado] = useState<number>(0);

const setearDataosAnulacion = () =>{
    setDataAnularInscripcion( prev => ({
        ...prev,
        idInscripcion : null, 
        monto_pagado : "",
        metodo_pago : "",
        modalAnular : false , 
        texto : "",
        mensajeError : "",
        carga : false, 
    }));
};

const manejarSeleccionInscripcion = ( id : number , metodo_pago : string, monto_pagado : string) => {

 if (!id) {  
    setearDataosAnulacion();
 }else{
    setDataAnularInscripcion( prev => ({
        ...prev,
        idInscripcion : id , 
        modalAnular : true , 
        metodo_pago : metodo_pago,
        monto_pagado : monto_pagado,
        texto : `Se anulara la inscripcion de : ${id},
                 metodo de pago : ${metodo_pago} `,
        mensajeError : ""
    }));
 };

};

const handleCancelarAnulacion = () =>{
    setearDataosAnulacion();
};

const handleAnularInscripcion = async () =>{
    setDataAnularInscripcion( prev => ({ ...prev , carga : true}));
    try {
       const servicioApiFetch  = config.servicios.anulacion;
       const respuestaAnulacion = await  servicioApiFetch({
            id_inscripcion : dataAnularInscripcion.idInscripcion as number,
       }); 

   
       switch (respuestaAnulacion.code ){
            case "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION" :{
                await new Promise(resolve => setTimeout(resolve, 600));
                //setActualizarListado( actualizarListado + 1);
                dispatch({ type : "SET_ACTUALIZAR_LISTADO"});
                setearDataosAnulacion();

                return;                    
            };

            case "SIN_PERMISO" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "No tienes permiso para anular esta inscripción.",
                }));
                return;
            };

            case "NO_EXISTE_CAJA" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "No se encontró una caja abierta para esta escuela, Abra una caja para poder anular la inscripción.",
                }));
                return;           
            };

            case "TRANSACCION_FALLIDA_ANULAR_INCRIPCION" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "Error al anular la inscripción, por favor intente nuevamente.",
                }));
                return;           
            };

            case "SIN_CATEGORIA_ANULACION" : {
                setDataAnularInscripcion( prev => ({
                    ...prev , 
                    mensajeError : respuestaAnulacion.message || "Error en el seteo de la categoría de anulación.",
                }));
                return;           
            };

            default : {
                setDataAnularInscripcion( prev => ({...prev , mensajeError : "Ocurrio un error al intentar anular la inscripcion, por favor intente nuevamente."}));
                return;
            };
       };

    }catch ( error) {
       setDataAnularInscripcion( prev => ({ ...prev , mensajeError : "Ocurrió un error inesperado al anular la inscripción."}));
    }finally{
       setDataAnularInscripcion( prev => ({ ...prev , carga : false})); 
    };
};

//////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//
//  LISTADO DE INSCRIPCIONES 
//
///////////////////////////////////////////////////////////////////////////////    

// Listado de isncriopciones --------------------------------------------------
useEffect( () =>{
 
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico : (mensaje) => dispatch({ type: 'SET_ERROR_GENERICO', payload: mensaje }),

        setCarga : ( estado ) => dispatch({ type: 'SET_CARGA', payload: estado })
    }); 
    
const listadoInscrip = async () => {
   
      dispatch({ type : "SET_CARGA" , payload : true});
    try {
        const servcioListado = config.servicios.listado;    
        const listadoRespuesta = await servcioListado(state.filtroData, signal);
       
        //  VALIDACIÓN CRÍTICA:
        // Si la respuesta no es lo que esperamos, no seteamos basura
        if (listadoRespuesta && listadoRespuesta.data) {
        
            dispatch({ type : "SET_LISTADO_INSCRIPCION", payload : listadoRespuesta.data});
           
           dispatch({type : "SET_BARRA_PAGINACION", payload : listadoRespuesta.paginacion});
        } else {
            // Si el back responde pero sin data (ej. 404), limpiamos
           
          
            dispatch({type : "SET_LISTADO_INSCRIPCION", payload : []});
     
            dispatch({ type : "SET_BARRA_PAGINACION", payload : {
                ...state.barraPaginacion,
                pagina : 1
            }});
        }

    } catch (error: any) {
        // Si el error es porque abortamos la petición, no hacemos nada
        if (error.name === 'AbortError') return;

        dispatch({ type : "SET_ERROR_GENERICO", payload : "Ocurrió un error inesperado al cargar el Listado."})

        dispatch({type : "SET_LISTADO_INSCRIPCION", payload : []});
    } finally {
        clearTimeout(timeoutId);
     
       dispatch({ type : "SET_CARGA" , payload : false});
    }        
};

    listadoInscrip();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };    
},[ state.filtroData, state.actualizarListado]);



    return{
        //carga,
        state,
    //--- EXPORT DE FILTROS DE BUSQUEDA ----   
        inputsFiltro: config.inputsFiltros,
        estado : config.estados,
     //   filtroData,
     //   barraPaginacion,
        handleChangaValue,
        handleChangeEstado,
        handleChangeFechaDesde,
        handleChangeFechaHasta,
        handlePaginaCambiada,
    //-------------------------------------    
        //dataListado,
    //-------------------------------------      
        abrirInscribir,
    //-------------------------------------  
        dataAnularInscripcion,
        manejarSeleccionInscripcion,
        handleCancelarAnulacion,
        handleAnularInscripcion,
    };
};