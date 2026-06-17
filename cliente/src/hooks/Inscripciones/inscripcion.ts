import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
//hooks

import { fechaHoy, fechaVencimiento } from "../../utils/fecha";
import { InscripcionReducer, inicialState} from "../../reducers/inscripcionReducer";

import { InscripcionAlumno } from "./InscripcionAlumno";
import { InscripcionPlan } from "./InscripcionPlan";
import { InscripcionIDS } from "./InscropcionIDS";
import { InscripcionMetodoPago } from "./InscripcionMetodoPago";

// Typados 
import {type PaginacionProps } from "../../tipadosTs/genericos";



/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface InscripcionConfig {

    usuario    : string,

    servicios :{
        listaAlumnosPaginado : ServicioCrud,
        listaPlanPaginado    : ServicioCrud,

        listadoAlumnosBusqueda : ServicioCrud,
        listadoPlanesBusqueda  : ServicioCrud,
        listadoCategoriaCaja     : ServicioCrud,    
        litaMetodoPago : ServicioCrud,

        metodoInscripcion   : ServicioCrud,
        registroMovimiento  : ServicioCrud,

        inscripcionCategoriaCaja : ServicioCrud,  
        obtenerIdCaja :  ServicioCrud
    },
    paginacion : PaginacionProps,

    inicialFiltroAlumno : { dni : string, apellido : string},
    inicialFiltroPlan   : { descripcion : string }
};


export const useInscipcion =( config : InscripcionConfig) =>{
     const navegar = useNavigate();

     const [ state , dispatch] = useReducer( InscripcionReducer, inicialState({

            usuario    : config.usuario,

            inicialFiltros :  {
                inicialFiltroAlumno : config.inicialFiltroAlumno,
                inicialFiltroPlan : config.inicialFiltroPlan
            },

            paginacion : config.paginacion
     }));

    // ─────────────────────────────
    // INFO ALUMNOS
    // ─────────────────────────────         
     const alumno = InscripcionAlumno({
        servicios : {
            listaAlumnosPaginado : config.servicios.listaAlumnosPaginado,
            listadoAlumnosBusqueda : config.servicios.listadoAlumnosBusqueda
        },
        state : state,
        dispatch : dispatch
     });

    // ─────────────────────────────
    // INFO PLANES
    // ───────────────────────────── 
    const plan = InscripcionPlan({
        servicios : {
            listaPlanPaginado : config.servicios.listaPlanPaginado,
            listadoPlanesBusqueda : config.servicios.listadoPlanesBusqueda
        },
        state : state,
        dispatch : dispatch        
    }); 

    // ─────────────────────────────
    // INFO METODOS DE PAGO
    // ───────────────────────────── 
    const metedoPago = InscripcionMetodoPago({
        servicios : {
            litaMetodoPago : config.servicios.litaMetodoPago,
        },
        state : state,
        dispatch : dispatch         
    });

    // ─────────────────────────────
    // INFO DE LOS IDS POR DEFECTO
    // ───────────────────────────── 
    const ids = InscripcionIDS({
        servicios : {
            inscripcionCategoriaCaja : config.servicios.inscripcionCategoriaCaja,
            obtenerIdCaja            : config.servicios.obtenerIdCaja
        },
        state : state,
        dispatch : dispatch         
    });

    const resetFormulario = () => {

        dispatch({type : "RESET_FILTRO_ALUMNO"})

        dispatch({type : "RESET_FILTRO_PLAN"});

        dispatch({ type : "SET_PLAN" , payload : null});
   
        dispatch({ type : "SET_ALUMNO" , payload : null});  
    
        dispatch({type : "SET_NOTAS" , payload : ""});

        dispatch( { type : "SET_ERROR_GENERICO" , payload : null});
  
    };


const handleInscribir = async (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

    
        if (state.alumno === null || state.plan === null || state.cuenta === null || state.detalleMovimientoIds.id_caja === null) {
            // Validación de infraestructura (Caja)
            if (state.detalleMovimientoIds.id_caja === null) { 
                dispatch({ type : "SET_ERROR_GENERICO", payload : "Abra caja antes de realizar una inscripcion"});
           
                return; 
            }

            //Caso extremo: Falta todo
            if (state.plan === null && state.alumno === null && state.cuenta === null) { 
                dispatch({ type : "SET_ERROR_GENERICO" , payload : "Seleccionar Plan, Alumno y Metodo de Pago"});
        
                return; 
            }

            //Casos individuales
            if (state.alumno === null) { dispatch({ type : "SET_ERROR_GENERICO" , payload : "Seleccionar alumno" }); return; }
            if (state.plan === null) { dispatch({ type : "SET_ERROR_GENERICO" , payload : "Seleccionar Plan" }); return; }
            if (state.cuenta === null) { dispatch({ type : "SET_ERROR_GENERICO" , payload : "Seleccione el metodo de pago" }); return; }
            
            return; // Seguridad extra
        }
        
        dispatch({type : "INICIAR_OPERACION_INSCRIPCION"});

        await new Promise(resolve => setTimeout(resolve, 600));
        try{
                // se carga el servicio de incripcion 
                const servicioApiFetch = config.servicios.metodoInscripcion;
                
                const datosInscpDetalle = {
                    //id_escuela : state.inscripcionData.id_escuela,
                    id_plan    : state.plan.id,
                    dni_alumno : Number(state.alumno.Dni),
                    fecha_inicio :fechaHoy(),
                    fecha_fin    : fechaVencimiento(state.plan.meses),
                    monto  : Number(state.plan.monto),
                    meses_asignados_inscritos : state.plan.meses,
                    clases_asignadas_inscritas : state.plan.clases,

                    id_caja : state.detalleMovimientoIds.id_caja,
                    id_categoria : state.detalleMovimientoIds.id_categoria,
                    id_cuenta : state.cuenta , // aca iria el ID del metodo de pago 
                    //id_usuario : state.inscripcionData.id_usuario,    
                    descripcion : state.notas, 
                };

                const subcripcionInsc = await servicioApiFetch( datosInscpDetalle );
                    
                if ( subcripcionInsc.code === "INSCRIPCION_EXITOSA" ){
                        resetFormulario();
                        dispatch({type : "MODAL_INSCRIPCION", payload : false});     
                        dispatch({type : "ACTUALIZAR_INSCRIPCION"});
                        navegar("/list_inscrip");              
                }else{
                   return dispatch({type : "SET_ERROR_GENERICO", payload : subcripcionInsc.message});
                }
        }catch(error){
            dispatch({ type : "SET_ERROR_GENERICO", payload : "Errr en conexion, intente nuevamente"})
        }finally{
            dispatch({type : "FINALIZAR_OPERACION_INSCRIPCION"});
        };  
};


const handleCancelar = (e : React.MouseEvent<HTMLButtonElement>) =>{
    e.preventDefault();
    dispatch( { type : "SET_ERROR_GENERICO" , payload : null});
    dispatch({type : "MODAL_INSCRIPCION", payload : false});        
    resetFormulario();
    navegar("/list_inscrip");// mando a la pagina princcipal para la inscripcion
};

    return{

        handleCachearPlan : plan.handleCachearPlan,
        handleCachearAlumno : alumno.handleCachearAlumno,
        handleCachearMetodoPago : metedoPago.handleCachearMetodoPago,
        handleTextAreaNotas : metedoPago.handleTextAreaNotas,

        handleInscribir,
        handleCancelar,

        state,
    };    
};