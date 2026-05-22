// Typados 
import {type PaginacionProps } from "../tipadosTs/genericos";
import type * as TipadoInscripcion from "../tipadosTs/inscripciones";
import { type DataCajaDetalleIDs } from "../tipadosTs/caja.typado";

// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================

interface MetodoPago {
  id_metodo: number;
  descripcion_cuenta: string;
};

export interface MetodoPagoInput {
    id_cuenta : number,
    nombre_cuenta : string,
    tipo_cuenta : string
};

export interface InscripcionTipado {
    inscripcionData : {
        id_usuario : number,
        id_escuela : number,
        usuario    : string,
        filtrosIniciales : {  
            inicialFiltroAlumno : { dni : string , apellido : string },
            inicialFiltroPlan   : { descripcion : string }
        },        
    },
    
    filtrosBusqueda : {
        filtroBusquedaAlumno :  TipadoInscripcion.FiltroAlumno,
        filtroBusquedaPlan   :  TipadoInscripcion.FiltroPlan
    },

    listadoPlan : TipadoInscripcion.DataPlan[],
    listadoAlumno : TipadoInscripcion.DataAlumno[],
    listadoMetodoPago : MetodoPago[],


    detalleMovimientoIds : DataCajaDetalleIDs,

    carga: boolean,
    enviando: boolean,
    
    cargaEntidades : {
        alumno : boolean,
        plan : boolean,
        metodoPago : boolean
    },
    
    errorGenerico: null | string,

    errorEntidades : {
        alumno : string  | null ,
        plan : string  | null,
        metodoPago : string  | null
    }

    actualizarListado : number,
    
    plan : TipadoInscripcion.DataPlan | null,
    alumno : TipadoInscripcion.DataAlumno | null,
    cuenta : number | null,
    notas : string ,

    modalInsc : boolean,
    actualizarIngresoInscipcion : number // se cambio a number para sumar en vez de cambiar el valor boolean


};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================

export const inicialState = ( config: { 
    id_escuela: number, 
    id_usuario: number , 
    usuario : string, 
    
    inicialFiltros : {
        inicialFiltroAlumno : { dni : string , apellido : string },
        inicialFiltroPlan   : { descripcion : string }
    },
    
    paginacion : PaginacionProps,

}) : InscripcionTipado => ({

    inscripcionData : {
        id_escuela : config.id_escuela,
        id_usuario : config.id_usuario,
        usuario    : config.usuario,
        filtrosIniciales : {
            inicialFiltroAlumno : config.inicialFiltros.inicialFiltroAlumno,
            inicialFiltroPlan   : config.inicialFiltros.inicialFiltroPlan,
        },
    },


    filtrosBusqueda : {
        filtroBusquedaAlumno : {
           ... config.inicialFiltros.inicialFiltroAlumno,
           estado : "activos",
           id_escuela : config.id_escuela,
           pagina     : config.paginacion.pagina,
           limite     : config.paginacion.limite 
        },

        filtroBusquedaPlan   : {
           ... config.inicialFiltros.inicialFiltroPlan,
           estado : "activos",
           id_escuela : config.id_escuela,
           pagina     : config.paginacion.pagina,
           limite     : config.paginacion.limite 
        }
    },

    listadoPlan : [],
    listadoAlumno : [],
    listadoMetodoPago :  [],
    
    detalleMovimientoIds : {
        id_caja : null,
        id_categoria : null
    },

    carga: false,
    enviando : false,

     cargaEntidades : {
        alumno : false, 
        plan : false,
        metodoPago : false
     },   

    errorGenerico: null  ,

    errorEntidades : {
        alumno : null,
        plan : null,
        metodoPago : null
    },

    actualizarListado : 0,

    plan : null,
    alumno : null,
    cuenta : null,
    notas : "",

    modalInsc : false,
    actualizarIngresoInscipcion : 0,

});

// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================

export type InscripcionAcciones = 

    | { type: 'SET_ERROR_GENERICO'; payload: string  | null}
    | { type : "SET_ERROR_ENTIDAD", payload : { entidad : "alumno" | "plan" | "metodoPago" , mensaje : string | null } }    
    | { type : "RESET_ERROR_ENTIDAD" }

    | { type: "FINALIZAR_OPERACION"}
    | { type: "FINALIZAR_OPERACION_INSCRIPCION"}    
    | { type: "INICIAR_OPERACION"} 
    | { type: "INICIAR_OPERACION_INSCRIPCION"}          
    
    | { type : "CARGADO"} 
    | { type : "SET_CARGANDO_ENTIDAD", payload : { entidad : "alumno" | "plan" | "metodoPago" , bandera :  boolean } }    
    | { type : "RESET_CARGANDO_ENTIDAD" }
    
    | { type : "ACTUALIZAR"}  
    | { type : "MODAL_INSCRIPCION" ; payload : boolean}   
    | { type : "ACTUALIZAR_LISTADO" }  
    | { type : "ACTUALIZAR_INSCRIPCION" }    
    
    | { type : "SET_PLAN" ; payload : TipadoInscripcion.DataPlan | null }   
    | { type : "SET_ALUMNO" ; payload : TipadoInscripcion.DataAlumno | null } 
    | { type : "SET_NOTAS" ; payload : string  } 
    | { type : "SET_MOVIMIENTOS_IDS" ; payload : DataCajaDetalleIDs}   
    | { type : "SET_CUENTA" ; payload : number | null} 
    
    | { type : "SET_FILTROS_ALUMNO" ; payload : TipadoInscripcion.FiltroAlumno} 
    | { type : "RESET_FILTRO_ALUMNO" }
    | { type : "SET_FILTROS_PLAN" ; payload : TipadoInscripcion.FiltroPlan} 
    | { type : "RESET_FILTRO_PLAN" }

    | { type : "SET_LISTADO_PLAN" , payload : TipadoInscripcion.DataPlan[]}
    | { type : "SET_LISTADO_ALUMNO", payload : TipadoInscripcion.DataAlumno[]}
    | { type : "SET_LISTADO_METODO_PAGO", payload : MetodoPago[]} 

// ==========================================
// 4. EL CEREBRO (REDUCER)
// ==========================================   

export const InscripcionReducer = (state: ReturnType<typeof inicialState>, action: InscripcionAcciones): ReturnType<typeof inicialState> => {  
    switch (action.type) {

        case 'SET_ERROR_GENERICO':
            return { ...state, errorGenerico: action.payload };

        case 'SET_ERROR_ENTIDAD':
            return { ...state, errorEntidades: { ...state.errorEntidades, [action.payload.entidad]: action.payload.mensaje } };

        case "SET_ERROR_ENTIDAD":
            return {
                    ...state,
                    errorEntidades: {
                        ...state.errorEntidades,
                        ...action.payload // Pisás solo el error del campo que falló
                    }
                };
       case "RESET_ERROR_ENTIDAD" :
           return {...state , errorEntidades : { alumno : null , plan : null  , metodoPago : null}}        


        case 'FINALIZAR_OPERACION':
            return { ...state, carga: false, errorGenerico: null };    
        
        case 'INICIAR_OPERACION':
            return { ...state, carga: true };         

        case 'INICIAR_OPERACION_INSCRIPCION':
            return { ...state, enviando: true };    
         
        case 'FINALIZAR_OPERACION_INSCRIPCION':
            return { ...state, enviando: false, errorGenerico: null };                

        case 'CARGADO':
            return { ...state, carga: false };            

        case "ACTUALIZAR" : 
            return { ...state, actualizarIngresoInscipcion : state.actualizarIngresoInscipcion +1 };  
            
        case "MODAL_INSCRIPCION" :
            return { ...state , modalInsc : action.payload}    
   
        case "ACTUALIZAR_LISTADO" :
            return { ...state , actualizarListado : state.actualizarListado + 1} 
              
        case "ACTUALIZAR_INSCRIPCION" :
            return { ...state , actualizarIngresoInscipcion : state.actualizarIngresoInscipcion + 1}                  




        case "SET_NOTAS" :
            return { ...state , notas : action.payload}

        case "SET_CUENTA" : 
            return {...state , cuenta : action.payload}

        case "SET_PLAN" :
            return {...state, plan : action.payload }

        case "SET_ALUMNO" :
            return {...state, alumno : action.payload }

        case "SET_MOVIMIENTOS_IDS": 
            return {
                ...state,
                detalleMovimientoIds: {
                    ...state.detalleMovimientoIds, 
                    ...action.payload              
                }
            };

        case "SET_FILTROS_ALUMNO" : 
           return {...state, filtrosBusqueda :{
                   ...state.filtrosBusqueda,
                   filtroBusquedaAlumno : action.payload
           }};   
           
        case "RESET_FILTRO_ALUMNO":
            return {
                ...state,
                filtrosBusqueda: {
                    ...state.filtrosBusqueda, 
                    filtroBusquedaAlumno: {     
                        ...state.inscripcionData.filtrosIniciales.inicialFiltroAlumno,
                        estado: "activos",
                        id_escuela: state.inscripcionData.id_escuela,
                        pagina: 1, 
                        limite: state.filtrosBusqueda.filtroBusquedaAlumno.limite 
                    }
                }
            };

        case "SET_FILTROS_PLAN" : 
           return {...state, filtrosBusqueda :{
                   ...state.filtrosBusqueda,
                   filtroBusquedaPlan : action.payload
           }};   
           
        case "RESET_FILTRO_PLAN":
            return {
                ...state,
                filtrosBusqueda: {
                    ...state.filtrosBusqueda, 
                    filtroBusquedaPlan: {     
                        ...state.inscripcionData.filtrosIniciales.inicialFiltroPlan,
                        estado: "activos",
                        id_escuela: state.inscripcionData.id_escuela,
                        pagina: 1, 
                        limite: state.filtrosBusqueda.filtroBusquedaPlan.limite 
                    }
                }
            };


        case "SET_LISTADO_PLAN" :
            return {...state, listadoPlan : action.payload};  
            
        case "SET_LISTADO_ALUMNO" :
            return {...state, listadoAlumno : action.payload};    
        
        case "SET_LISTADO_METODO_PAGO" :
            return {...state, listadoMetodoPago : action.payload};             
   default:

        return state;
  };             
};

