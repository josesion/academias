import { type ResultInfoEscuela } from "../servicio/principal.alumnos.fetch";
import { type HorarioClaseData } from "../componentes/SeccionAlumnos/Horarios/Horarios";

export interface InfoEscuelaTipado {
    error: string | null;
    errorHorario : string | null,

    modal: {
        error: boolean;
        horario: boolean;
    };

    carga: {
        infoEscuela: boolean;
        horario: boolean;
    };

    id_escuela: number | null;
    data: ResultInfoEscuela | null;
    horario: HorarioClaseData[] | null; // Tipado como array para la grilla
}

export const initialInfoEscuela = (): InfoEscuelaTipado => ({
    error: null,
    errorHorario : null,

    modal: {
        error: false,
        horario: false, // Inicializamos el modal de horario en falso
    },

    carga: {
        infoEscuela: false,
        horario: false, // Inicializamos la carga de horario en falso
    },

    id_escuela: null,
    data: null,
    horario: null,
});

export type InfoEscuelaAction = 
    | { type: "SET_ID_ESCUELA"; payload: number | null }
    | { type: "INFO_ESCUELA_OK"; payload: ResultInfoEscuela | null }
    | { type: "SET_CARGA_ERROR"; payload: string | null }
    | { type: "SET_HORARIO_ERROR"; payload: string | null } 
    | { type: "SET_ESCUELA_ERROR"; payload: string | null }        
    | { type: "SET_CARGA_INFO_ESCUELA"; payload: boolean }
    | { type: "SET_CARGA_HORARIO"; payload: boolean }    
    | { type: "SET_MODAL_HORARIO"; payload: boolean }   
    | { type: "SET_CERRAR_MODAL_ERROR"}
    | { type: "SET_HORARIO_ESCUELA"; payload: HorarioClaseData[] | null };

export const InfoEscuelaReducer = ( 
    state: ReturnType<typeof initialInfoEscuela>, 
    action: InfoEscuelaAction
): ReturnType<typeof initialInfoEscuela> => {

    switch (action.type) {

        case "SET_ID_ESCUELA":
            return {
                ...state,
                id_escuela: action.payload
            };

        case "INFO_ESCUELA_OK":
            return {
                ...state,
                data: action.payload
            }; 
            
        case "SET_CARGA_ERROR":
            return {
                ...state,
                error: action.payload,      
                modal: {
                    ...state.modal,
                    error: true            
                }
            };

        case "SET_ESCUELA_ERROR" :
            return{
                ...state,
                error : action.payload
            };            

        case "SET_HORARIO_ERROR" :
            return{
                ...state,
                errorHorario : action.payload
            };    

        case "SET_CARGA_INFO_ESCUELA":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    infoEscuela: action.payload    
                }
            }; 

        case "SET_CARGA_HORARIO":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    horario: action.payload
                }
            };

        case "SET_MODAL_HORARIO":
            return {
                ...state,
                modal: {
                    ...state.modal,
                    horario: action.payload
                }
            };

        case "SET_HORARIO_ESCUELA":
            return {
                ...state,
                horario: action.payload
            };

        case "SET_CERRAR_MODAL_ERROR" :
            return {
                ...state,
                modal : {
                    ...state.modal,
                    error : false
                }
            }    

        default:
            return state; 
    };
};