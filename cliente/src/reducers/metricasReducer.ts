import type{  ResultClase, ResultTarjeta, ResultAsistencia } from "../servicio/metrica.fetch";
// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================

export interface MetricaUsuario {
    carga : {
        tarjeta : boolean,
        clases   : boolean,
        asistencia:boolean
    },
    error  : {
        tarjeta : string | null,
        clases   : string | null,
        asistencia: string| null,
    },

    tarjetas : ResultTarjeta | null,
    clases   : ResultClase   | null,
    asistencias : ResultAsistencia[] | null,
};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================

export const initialStateMetricas = ( ) :MetricaUsuario =>({

    carga : {
        tarjeta : false,
        clases   : false,
        asistencia : false
    },

    error : {
        tarjeta : null,
        clases   : null,
        asistencia : null 
    },

    tarjetas : null,
    clases   : null,
    asistencias : null,

});

// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================
export type MetricaAction =  
      | { type: 'SET_ERROR_TARJETA' , payload : string | null}
      | { type: 'SET_CARGA_TARJETA', payload : boolean }
      | { type: 'SET_TARJETAS',  payload : ResultTarjeta | null }     
      | { type: 'SET_ERROR_CLASE' , payload : string | null}
      | { type: 'SET_CARGA_CLASE', payload : boolean }
      | { type: 'SET_CLASE',  payload : ResultClase | null } 
      | { type: 'SET_ERROR_ASISTENCIA' , payload : string | null}
      | { type: 'SET_CARGA_ASISNTECIA', payload : boolean }
      | { type: 'SET_ASISTENCIA',  payload : ResultAsistencia[] | null }  


// ==========================================
// 4. EL CEREBRO (REDUCER)
// ==========================================
export const metricasReducer = (state: ReturnType<typeof initialStateMetricas>, action: MetricaAction)
: ReturnType<typeof initialStateMetricas> =>{
      switch(action.type){
//------------------------------------- PARA TARJETAS
      case "SET_ERROR_TARJETA" :
          return{ ...state,
                error: {
                    ...state.error, 
                    tarjeta: action.payload 
                }
          };

        case "SET_CARGA_TARJETA":
            return { 
                ...state,
                carga: {
                    ...state.carga, 
                    tarjeta: action.payload 
                }
            };

      case  "SET_TARJETAS" :
        return {...state, tarjetas : action.payload };    
//------------------------------------- PARA CLASES

      case "SET_ERROR_CLASE" :
          return{ ...state,
                error: {
                    ...state.error, 
                    clases : action.payload 
                }
          };

        case "SET_CARGA_CLASE":
            return { 
                ...state,
                carga: {
                    ...state.carga, 
                    clases : action.payload 
                }
            };

      case  "SET_CLASE" :
        return {...state, clases : action.payload };
//------------------------------------- PARA ASISTENCIA
      case "SET_ERROR_ASISTENCIA" :
          return{ ...state,
                error: {
                    ...state.error, 
                    asistencia : action.payload 
                }
          };

        case "SET_CARGA_ASISNTECIA":
            return { 
                ...state,
                carga: {
                    ...state.carga, 
                    asistencia : action.payload 
                }
            };

      case  "SET_ASISTENCIA" :
        return {...state, asistencias : action.payload };

 
        default:
                return state;       
      };
};