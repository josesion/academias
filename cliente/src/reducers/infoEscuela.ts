import { type ResultInfoEscuela } from "../servicio/principal.alumnos.fetch";
import { type HorarioClaseData } from "../componentes/SeccionAlumnos/Horarios/Horarios";
import { type AsistenciaInscripcionRow } from "../tipadosTs/asistencia.typado";

export interface InfoEscuelaTipado {
    error: string | null;
    errorHorario : string | null,
    errorClasesAsistidas : string | null,

    modal: {
        error: boolean;
        horario: boolean;
        clasesAsistidas: boolean;
    };

    carga: {
        infoEscuela: boolean;
        horario: boolean;
        clasesAsistidas: boolean;
    };

    /**
     * Contador que se incrementa al pedir "Reintentar" en el modal de horarios.
     * Forma parte de las dependencias del `useEffectServicio` del horario para
     * que vuelva a disparar el GET sin tocar `id_escuela`.
     */
    refrescoHorario: number;

    id_escuela: number | null;
    data: ResultInfoEscuela | null;
    horario: HorarioClaseData[] | null; // Tipado como array para la grilla
    clasesAsistidas: AsistenciaInscripcionRow[] | null;
}

export const initialInfoEscuela = (): InfoEscuelaTipado => ({
    error: null,
    errorHorario : null,
    errorClasesAsistidas : null,

    modal: {
        error: false,
        horario: false, // Inicializamos el modal de horario en falso
        clasesAsistidas: false,
    },

    carga: {
        infoEscuela: false,
        horario: false, // Inicializamos la carga de horario en falso
        clasesAsistidas: false,
    },

    refrescoHorario: 0,

    id_escuela: null,
    data: null,
    horario: null,
    clasesAsistidas: null,
});

export type InfoEscuelaAction = 
    | { type: "SET_ID_ESCUELA"; payload: number | null }
    | { type: "INFO_ESCUELA_OK"; payload: ResultInfoEscuela | null }
    | { type: "SET_CARGA_ERROR"; payload: string | null }
    | { type: "SET_HORARIO_ERROR"; payload: string | null } 
    | { type: "SET_ESCUELA_ERROR"; payload: string | null }
    | { type: "SET_ERROR_CLASES_ASISTIDAS"; payload: string | null }        
    | { type: "SET_CARGA_INFO_ESCUELA"; payload: boolean }
    | { type: "SET_CARGA_HORARIO"; payload: boolean }
    | { type: "SET_CARGA_CLASES_ASISTIDAS"; payload: boolean }    
    | { type: "SET_MODAL_HORARIO"; payload: boolean }
    | { type: "SET_MODAL_CLASES_ASISTIDAS"; payload: boolean }   
    | { type: "SET_CERRAR_MODAL_ERROR"}
    | { type: "SET_CERRAR_MODAL_CLASES"}
    | { type: "SET_HORARIO_ESCUELA"; payload: HorarioClaseData[] | null }
    | { type: "SET_CLASES_ASISTIDAS"; payload: AsistenciaInscripcionRow[] | null }
    | { type: "REINTENTAR_HORARIO" };

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

        case "REINTENTAR_HORARIO":
            return {
                ...state,
                errorHorario: null,
                refrescoHorario: state.refrescoHorario + 1
            };

        case "SET_CLASES_ASISTIDAS":
            return {
                ...state,
                clasesAsistidas: action.payload
            };

        case "SET_ERROR_CLASES_ASISTIDAS":
            return {
                ...state,
                errorClasesAsistidas: action.payload
            };

        case "SET_CARGA_CLASES_ASISTIDAS":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    clasesAsistidas: action.payload
                }
            };

        case "SET_MODAL_CLASES_ASISTIDAS":
            return {
                ...state,
                modal: {
                    ...state.modal,
                    clasesAsistidas: action.payload
                }
            };

        case "SET_CERRAR_MODAL_ERROR" :
            return {
                ...state,
                modal : {
                    ...state.modal,
                    error : false
                }
            }    

        case "SET_CERRAR_MODAL_CLASES" :
            return {
                ...state,
                modal : {
                    ...state.modal,
                    clasesAsistidas : false
                }
            }    

        default:
            return state; 
    };
};