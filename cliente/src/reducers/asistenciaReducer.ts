import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";


// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================

export interface AsitenciaTipado {
    actualizar : number,
    nombreEscuela : string | null,
    errorGenerico : string | null,
    exitoAsistencia : boolean,
    /** Clases en curso como array (puede haber múltiples en salas distintas) */
    claseEnCurso : TipadoAsistencia.ResultadoClaseEnCruso[] | TipadoAsistencia.ResultErrorAsistencia,
    /** Próximas clases como array (puede haber múltiples en salas distintas) */
    claseProxima : TipadoAsistencia.ResultadoClaseProxima[] | TipadoAsistencia.ResultErrorAsistencia,
    dataInscripcion : TipadoAsistencia.DataInscripcionVigente | null,
    dataAsistencia  : TipadoAsistencia.ResultDataAsistencia,
    registroAsistencia : TipadoAsistencia.BusquedaAlumno,
    /** Clase seleccionada cuando hay múltiples horarios en curso (kiosko) */
    claseSeleccionada : number | null,
};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================

export const initialState = (): AsitenciaTipado =>({
    actualizar : 0,
    nombreEscuela : null,
    errorGenerico : null,
    exitoAsistencia : false, 
    claseEnCurso : [],
    claseProxima : [],
    
    dataAsistencia :  { 
        dataHorario : { error : null , message: null , code : null},
        dataInscripcion : { error : null , message: null , code : null, dni_alumno: null}
    },
    dataInscripcion : null,

    registroAsistencia : { 
        pin_asistencia : "", estado : "activos"
    },
    claseSeleccionada : null,

});


// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================
export type AsistenciaAction =
    | { type :  "SET_NOMBRE_ESCUELA", payload : string | null } 
    | { type :  "SET_ACTUALIZAR" }     
    | { type: 'SET_ERROR_GENERICO'; payload: string | null }
    | { type: 'SET_CLASE_SELECCIONADA'; payload: number | null }

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
// Ahora ambos son arrays: puede haber múltiples clases simultáneas
// en salas distintas (kiosko).

    | { type: 'SET_CARTELES_OK'; payload:{
        claseEnCurso : TipadoAsistencia.ResultadoClaseEnCruso[] | TipadoAsistencia.ResultErrorAsistencia,
        claseProxima : TipadoAsistencia.ResultadoClaseProxima[] | TipadoAsistencia.ResultErrorAsistencia,
    }}



export const asistenciaReducer = (state: ReturnType<typeof initialState>, action: AsistenciaAction)
: ReturnType<typeof initialState> => {
  
        switch(action.type){
            case "SET_ACTUALIZAR" : 
                return { ...state, actualizar : state.actualizar + 1 }

            case "SET_NOMBRE_ESCUELA" : 
                return { ...state, nombreEscuela : action.payload}

            case "SET_ERROR_GENERICO" :
                return{ ...state, errorGenerico : action.payload };

            case "SET_REGISTRO_ASISTENCIA" :
                return{ ...state, registroAsistencia : action.payload };

            case "SET_ASISTENCIA_OK" :{
                // Si hay un solo horario, lo selecciono automáticamente
                const horarios = action.payload.dataAsistencia.dataHorario;
                let claseSel = state.claseSeleccionada;
                if (Array.isArray(horarios)) {
                    if (horarios.length === 1) {
                        claseSel = horarios[0].id_horario_clase;
                    } else if (horarios.length > 1) {
                        // Múltiples horarios: resetear para que el usuario elija
                        claseSel = null;
                    }
                }
                return{
                    ...state, 
                    dataAsistencia : action.payload.dataAsistencia,
                    dataInscripcion : action.payload.dataInscripcion,
                    errorGenerico : null,
                    claseSeleccionada : claseSel
                };
            };   
            
            case "SET_ASISTENCIA_FALLO" : 
                return {
                    ...state,
                    dataAsistencia :{         
                        dataHorario : { error : null , message: null , code : null},
                         dataInscripcion : { error : null , message: null , code : null, dni_alumno: null}  },
                    errorGenerico  : action.payload.erroGenerico,
                    dataInscripcion: null
                };

            case "SET_PEAJE_RESET":{
                return{
                    ...state,
                    errorGenerico : null,
                    dataInscripcion : null ,
                    claseSeleccionada : null,
                    dataAsistencia : {
                        dataHorario : { error : null , message: null , code : null},
                        dataInscripcion : { error : null , message: null , code : null, dni_alumno: null}  
                    } 
                };
            }; 
            
            case "SET_EXITOSA_ASISTENCIA": 
                return { ...state, exitoAsistencia : action.payload };

            case "SET_REGISTRO_ASISTENCIA_OK":{
                return{
                    ...state,
                    registroAsistencia :  { pin_asistencia : "", estado : "activos"},
                    dataAsistencia : {
                        dataHorario : { error : null , message: null , code : null},
                       dataInscripcion : { error : null , message: null , code : null, dni_alumno: null}                      
                    },
                    errorGenerico : null,
                    dataInscripcion : null,
                    claseSeleccionada : null,
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

            case "SET_CLASE_SELECCIONADA": {
                return {
                    ...state,
                    claseSeleccionada : action.payload
                };
            };

            default:
                    return state;
            };                

};
