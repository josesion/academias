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
        listadoCuentas : ServicioCrud
    },

    estados: string[] ; 
    inputsFiltros: any[];
    inicialFiltros : any;
    paginacion :  PaginacionProps
};

interface RetornoListadoCuentas {
    id_cuenta : number,
    nombre_cuenta  : string,
    tipo_cuenta : string
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


const manejarSeleccionInscripcion = ( 
    id: number,
    metodo_pago: string,
    monto_pagado: string,
    nombre_completo: string,
    clases_totales: number,
    clases_tomadas: number,
    dni_alumno: number,
    vigencia: string,
) => {

 if (!id) {  
     dispatch({ type : "SET_FORMATEAR_ANULACION" });
 }else{

    dispatch({ type : "SET_INFO_DETALLE", payload : {
        metodo_pago_descrip : String(metodo_pago),
        monto_pagado :  monto_pagado,
        nombre_completo : nombre_completo,
        dni_alumno : dni_alumno,
        clases_totales : clases_totales,
        clases_tomadas : clases_tomadas, 
        vigencia: vigencia       
    }});

 };
    dispatch({ type : "SET_INFO_ANULAR", payload : {
        ...state.dataAnularInscripcion,
        idInscripcion : id , 
        modalAnular : true , 
        metodo_pago : metodo_pago,
        monto_pagado : monto_pagado,
        texto : `Se anulara la inscripcion de : ${id},
                 metodo de pago : ${metodo_pago} `       
    }});
 
};


const handleCancelarAnulacion = () =>{
    //setearDataosAnulacion();
    dispatch({ type : "SET_FORMATEAR_ANULACION"});
};

const handleCachearMetodoPago = (e: React.ChangeEvent<HTMLSelectElement>) =>{
   
    if ( e.target.value){
        dispatch({ 
            type: "SET_CACHEAR_METODO_PAGO", 
            payload: { 
                listoAnular: true, 
                dataAnularInscripcion: {
                    ...state.dataAnularInscripcion,
                    id_cuenta: Number(e.target.value)
                }
            }
        });
    }else{
        dispatch({ 
            type: "SET_CACHEAR_METODO_PAGO", 
            payload: { 
                listoAnular: false, 
                dataAnularInscripcion: {
                    ...state.dataAnularInscripcion,
                    id_cuenta: null
                }
            }
        });
    }
}; 

const handleAnularInscripcion = async () =>{


    if ( state.listoAnular === false ) {
        dispatch({ type : "SET_ERROR_ANULAR", payload : "Seleccione metodo de pago" });
        return;
    };

    dispatch({ type : "SET_ERROR_ANULAR", payload : null });
    dispatch({ type : "SET_ANULAR_CARGAR", payload : { ...state.dataAnularInscripcion, carga : true} });

    try {
       
       const servicioApiFetch  = config.servicios.anulacion;
       const respuestaAnulacion = await  servicioApiFetch({
            id_inscripcion : state.dataAnularInscripcion.idInscripcion as number,
            id_cuenta : state.dataAnularInscripcion.id_cuenta
       }); 

       if (respuestaAnulacion.code === "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION"){
            await new Promise(resolve => setTimeout(resolve, 600));
            dispatch({ type : "SET_ACTUALIZAR_LISTADO"});
            dispatch({ type : "SET_FORMATEAR_ANULACION" });
       }else{
             dispatch({ type : "SET_ERROR_ANULAR", payload : respuestaAnulacion.message });
       };

    }catch ( error) {
       dispatch({ type : "SET_ERROR_ANULAR", payload  : "Ocurrió un error inesperado al anular la inscripción." });
    }finally{
       dispatch({ type : "SET_ANULAR_CARGAR", payload : { ...state.dataAnularInscripcion, carga : false} });
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

useEffect( ()=> {

    const listadoMetodosPago = async() =>{
        const data = { estado : "activos"}
        const servicioApifetch = config.servicios.listadoCuentas;
        const listaCuentasResult = await servicioApifetch( data );
       // console.log(listaCuentasResult)
        if ( listaCuentasResult.code === 'LISTA_TIPOS_CUENTAS_OK' ){
            const listadoRefacto =    listaCuentasResult.data.map( (item : RetornoListadoCuentas) =>({
                    id_cuenta: item.id_cuenta,
                    nombre_cuenta: `${item.nombre_cuenta} : (${item.tipo_cuenta})`
            }));    
            dispatch({ type : "SET_LISTADO_CUENTAS",payload : listadoRefacto });
        }else{
            dispatch({ type : "SET_LISTADO_CUENTAS",payload : [] });  
        }
    };      

    listadoMetodosPago();

}, [] );

    return{
        //carga,
        state,
    //--- EXPORT DE FILTROS DE BUSQUEDA ----   
        inputsFiltro: config.inputsFiltros,
        estado : config.estados,
        handleChangaValue,
        handleChangeEstado,
        handleChangeFechaDesde,
        handleChangeFechaHasta,
        handlePaginaCambiada,   
    //-------------------------------------      
        abrirInscribir,
    //-------------------------------------  
        manejarSeleccionInscripcion,
        handleCancelarAnulacion,
        handleAnularInscripcion,
        handleCachearMetodoPago,
    };
};