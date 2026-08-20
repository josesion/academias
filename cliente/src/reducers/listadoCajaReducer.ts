import type{ CajasServicioResponse, DataEstadoResult, 
             ResultUsuariosEscuela, CajasResumenResponse,
} from "../servicio/historial.cajas.fetch";
import type{  FiltrosBusqueda } from "../componentes/BuscadorLateral/BuscadorLateral";


import { fechaHoy, calcularSeisMesesAtras } from "../utils/fecha";

interface Paginacion {
    pagina : number, limite? : number , contadorPagina : number
}


export interface ListadoCajas{
    modal :{
        libroDiario : boolean,
    },

    carga : {
        encabezado : boolean,
        historial  : boolean,
        usuarios   : boolean,
    },

    error : {
        encabezado : string | null,
        historial  : string | null,
        usuarios   : string | null,
    },

    estadoCaja : DataEstadoResult  | null,

    historialCajas : CajasServicioResponse | null

    filtrosBusqueda :FiltrosBusqueda;

    paginacion : Paginacion

    usuariosEscuela : ResultUsuariosEscuela[] | null,

 // LIBRO DIARIO ----------------------------------------------

    detalleCaja : CajasResumenResponse | null,    

};


export const initialStateListadoCaja = () : ListadoCajas =>({
    modal : { libroDiario : false},

    carga : {
        encabezado : false,
        historial  : false,
        usuarios   : false,
    },

    error : {
        encabezado : null,
        historial  : null,
        usuarios   : null,
    },

    estadoCaja : null, 

    historialCajas :{
        dataDetalle : null,
        dataMetodo : null,
        paginacion : null
    },

    filtrosBusqueda : {
        idUsuarioFiltro :  null,
        estadoDiferencia    : null,
        fechaDesde    : calcularSeisMesesAtras( fechaHoy() ),
        fechaHasta    : fechaHoy(),
    },

    paginacion : {
        pagina : 1,
        contadorPagina :1
    },

   usuariosEscuela : null, 

   // LIBRO DIARIO ----------------------------------------------

    detalleCaja  : null,

});


export type ListadoCajaAction =

   | { type : "SET_MODAL_LIBRO_DIARIO" , payload : boolean}

// ──────────────────────────────────────────────────────────────
// Encabezado del historial de caja 
// ──────────────────────────────────────────────────────────────  

   | { type : "SET_CARGA_ESTADO", payload : boolean}
   | { type : "SET_ERROR_ESTADO_CAJA", payload : string}
   | { type : "SET_ESTADO_CAJA"  , payload : DataEstadoResult | null }


// ──────────────────────────────────────────────────────────────
// Lista de  hisotrial de cajas mas los metodos de pagos
// ──────────────────────────────────────────────────────────────     

   | { type : "SET_CARGA_HISTORIAL", payload : boolean }
   | { type : "SET_ERROR_HISTORIAL_CAJA", payload : string}
   | { type : "SET_HISOTRIAL_CAJAS", payload : CajasServicioResponse }

// ──────────────────────────────────────────────────────────────
// Filtros de busqueda
// ──────────────────────────────────────────────────────────────    

  | { type : "SET_FILTRO_BUSQUEDA_USUARIO", payload : number | null}  
  | { type : "SET_FILTRO_BUSQUEDA_ESTADO", payload :  "exacta" | "con_diferencia" | null}
  | { type : "SET_FILTRO_BUSQUEDA_FECHAD", payload : string }    
  | { type : "SET_FILTRO_BUSQUEDA_FECHAH", payload : string }
  | { type : "SET_FILTRO_PAGINACION", payload : Paginacion  }
  | { type : "ACTUALIAR_PAGINA" , payload : number }

// ──────────────────────────────────────────────────────────────
// Listado usuarios
// ──────────────────────────────────────────────────────────────   
| { type : "SET_CARGA_USUARIOS", payload : boolean}
| { type : "SET_ERROR_USUARIOS", payload : string | null}    
| { type : "SET_LISTADO_USUARIOS", payload : ResultUsuariosEscuela[] | null }


 // LIBRO DIARIO ----------------------------------------------

 | { type : "SET_DETALLE_CAJA", payload : CajasResumenResponse | null }

export const listadoCajaReducer = ( state : ReturnType< typeof initialStateListadoCaja>, action : ListadoCajaAction )
:ReturnType< typeof initialStateListadoCaja> =>{

    switch( action.type ){

        case "SET_MODAL_LIBRO_DIARIO" :
            return {
                ...state , 
                modal : {
                    libroDiario : action.payload
            }}

// ──────────────────────────────────────────────────────────────
// Encabezado del historial de caja 
// ──────────────────────────────────────────────────────────────              

        case "SET_ESTADO_CAJA" :
            return {
                ...state, estadoCaja : action.payload }      
            
        case "SET_CARGA_ESTADO" :
            return {
                ...state,
                carga : { ...state.carga, encabezado : action.payload }
            }    


        case "SET_ERROR_ESTADO_CAJA" :
            return {
                ...state,
                error : { ...state.error ,  encabezado : action.payload}
            }  
            
            
// ──────────────────────────────────────────────────────────────
// Lista de  hisotrial de cajas mas los metodos de pagos
// ──────────────────────────────────────────────────────────────              
        case "SET_CARGA_HISTORIAL" :
            return {
                ...state,
                carga : { ...state.carga, historial : action.payload }
            }    
        
 

        case "SET_ERROR_HISTORIAL_CAJA" :
            return {
                ...state,
                error : { ...state.error ,  historial : action.payload}
            } 
    
       case "SET_HISOTRIAL_CAJAS" :
            return{
                ...state,
                historialCajas : action.payload 
            }

// ──────────────────────────────────────────────────────────────
// Filtros de busqueda
// ──────────────────────────────────────────────────────────────    
     case "SET_FILTRO_BUSQUEDA_USUARIO" :
        return {
            ...state,
            filtrosBusqueda :{ ...state.filtrosBusqueda, idUsuarioFiltro : action.payload}
        }

    case "SET_FILTRO_BUSQUEDA_ESTADO" :
        return {
            ...state,
            filtrosBusqueda : { ...state.filtrosBusqueda, estadoDiferencia : action.payload}
        }  
    
    case "SET_FILTRO_BUSQUEDA_FECHAD" : 
        return {
            ...state,
            filtrosBusqueda : { ...state.filtrosBusqueda, fechaDesde : action.payload}
        }      
        
    case "SET_FILTRO_BUSQUEDA_FECHAH" : 
        return {
            ...state,
            filtrosBusqueda : { ...state.filtrosBusqueda, fechaHasta : action.payload}
        }
        
    case "SET_FILTRO_PAGINACION" :
        return {
            ...state,
            paginacion : action.payload
        }      

    case "ACTUALIAR_PAGINA" : 
        return {
            ...state,
            paginacion : {
                ...state.paginacion,
                pagina : action.payload
            }
        }    

// ──────────────────────────────────────────────────────────────
// Listado usuarios
// ──────────────────────────────────────────────────────────────          
    case "SET_CARGA_USUARIOS" :
        return {
            ...state,
            carga : { ...state.carga, usuarios : action.payload}
        }    

    case "SET_ERROR_USUARIOS" :
        return {
            ...state,
            error : { ...state.error, usuarios : action.payload}
        }    

    case "SET_LISTADO_USUARIOS" : 
       return {
         ...state,
         usuariosEscuela : action.payload
       }      

   
 // LIBRO DIARIO ----------------------------------------------

    case "SET_DETALLE_CAJA" : 
       return {
        ...state,
        detalleCaja : action.payload 
       }    

     default:
            return state;
    };

};   