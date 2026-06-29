import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";


// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================

export interface AsitenciaTipado {
   
    errorGenerico : string | null,
    exitoAsistencia : boolean,
    claseEnCurso : TipadoAsistencia.ResultadoClase_en_cursos,
    claseProxima : TipadoAsistencia.ResultadoClase_proxima,
    dataInscripcion : TipadoAsistencia.DataInscripcionVigente | null,
    dataAsistencia  : TipadoAsistencia.ResultDataAsistencia,
    registroAsistencia : TipadoAsistencia.BusquedaAlumno,

};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================

export const initialState = (): AsitenciaTipado =>({
    errorGenerico : null,
    exitoAsistencia : false, 
    claseEnCurso : { error : null , message: null , code : null},
    claseProxima : { error : null , message: null , code : null},
    
    dataAsistencia :  { 
        dataHorario : { error : null , message: null , code : null},
        dataInscripcion : { error : null , message: null , code : null}
    },
    dataInscripcion : null,

    registroAsistencia : { 
        dni_alumno : "", estado : "activos"
    },

});


// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================
export type AsistenciaAction =
    
    | { type: 'SET_ERROR_GENERICO'; payload: string | null }

// ──────────────────────────────────────────────────────────────
// estados para  handleCachearAlumno
// ────────────────────────────────────────────────────────────── 

    | { type: 'SET_REGISTRO_ASISTENCIA'; payload:  TipadoAsistencia.BusquedaAlumno }

    | { type: 'SET_ASISTENCIA_OK'; payload: {
            dataAsistencia: TipadoAsistencia.ResultDataAsistencia;
            dataInscripcion: TipadoAsistencia.DataInscripcionVigente;  
            errorGenerico : null         
    } }
    | { type: 'SET_ASISTENCIA_FALLO'; payload:{
           dataAsistencia : TipadoAsistencia.ResultDataAsistencia;
           erroGenerico :  string ;
           dataInscripcion : null
    }}

    | { type: 'SET_PEAJE_RESET'}

    | { type: 'SET_EXITOSA_ASISTENCIA'; payload: boolean } 

    
// ──────────────────────────────────────────────────────────────
// estados para  handleResgistrarAsistencia
// ────────────────────────────────────────────────────────────── 

    | { type: 'SET_REGISTRO_ASISTENCIA_OK'  }

// ──────────────────────────────────────────────────────────────
// estados para  UseEffect   para la asistencia
// ────────────────────────────────────────────────────────────── 

    | { type: 'SET_CARTELES_OK'; payload:{
        claseEnCurso : TipadoAsistencia.ResultadoClase_en_cursos,
        claseProxima : TipadoAsistencia.ResultadoClase_proxima,
    }}



export const asistenciaReducer = (state: ReturnType<typeof initialState>, action: AsistenciaAction)
: ReturnType<typeof initialState> => {
  
        switch(action.type){

            case "SET_ERROR_GENERICO" :
                return{ ...state, errorGenerico : action.payload };

            case "SET_REGISTRO_ASISTENCIA" :
                return{ ...state, registroAsistencia : action.payload };

            case "SET_ASISTENCIA_OK" :{
                return{
                    ...state, 
                    dataAsistencia : action.payload.dataAsistencia,
                    dataInscripcion : action.payload.dataInscripcion,
                    errorGenerico : null
                };
            };   
            
            case "SET_ASISTENCIA_FALLO" : 
                return {
                    ...state,
                    dataAsistencia :{         
                        dataHorario : { error : null , message: null , code : null},
                         dataInscripcion : { error : null , message: null , code : null}  },
                    errorGenerico  : action.payload.erroGenerico,
                    dataInscripcion: null
                };

            case "SET_PEAJE_RESET":{
                return{
                    ...state,
                    errorGenerico : null,
                    dataInscripcion : null ,
                    dataAsistencia : {
                        dataHorario : { error : null , message: null , code : null},
                        dataInscripcion : { error : null , message: null , code : null}  
                    } 
                };
            }; 
            
            case "SET_EXITOSA_ASISTENCIA": 
                return { ...state, exitoAsistencia : action.payload };

            case "SET_REGISTRO_ASISTENCIA_OK":{
                return{
                    ...state,
                    registroAsistencia :  { dni_alumno : "", estado : "activos"},
                    dataAsistencia : {
                        dataHorario : { error : null , message: null , code : null},
                       dataInscripcion : { error : null , message: null , code : null}                      
                    },
                    errorGenerico : null,
                    dataInscripcion : null,
                    exitoAsistencia : true
                };
            };
            
            case "SET_CARTELES_OK": {
                return {
                    ...state,
                    claseEnCurso : action.payload.claseEnCurso,
                    claseProxima : action.payload.claseProxima
                };
            };

            default:
                    return state;
            };                

};
