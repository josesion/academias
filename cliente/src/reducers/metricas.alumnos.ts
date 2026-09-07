import type {  RespuestaMetricasAlumnos } from "../servicio/principal.alumnos.fetch";



export interface MetricasAlumnoTipado {

    correo : string | null,

    error : {
        metricas : string  | null
    },

    carga : {
        metricas : boolean
    }

    data  : RespuestaMetricasAlumnos | null

};


export const initialMetricasAlumno = ( ) :MetricasAlumnoTipado =>({

    correo : null ,

    error : {
        metricas : null
    },

    carga : {
        metricas : false
    },

    data : null
});


export type MetricasAlumnosAction = 
  | { type : "SET_CORREO", payload : string}
  | { type: 'METRICAS_CARGA' ; payload : boolean }
  | { type: 'METRICAS_EXITO'; payload: RespuestaMetricasAlumnos  | null}
  | { type: 'METRICAS_ERROR'; payload: string | null}



export const MetricasAlumnosReducer = ( 
    state: ReturnType<typeof initialMetricasAlumno>, 
    action: MetricasAlumnosAction
): ReturnType<typeof initialMetricasAlumno> => {

    switch (action.type) {

        case "SET_CORREO" :
            return{
                ...state,
                correo : action.payload
            }


        case 'METRICAS_CARGA':
            return {
                ...state,
                carga: {
                    ...state.carga,
                    metricas: action.payload
                }
            };

        case 'METRICAS_EXITO':
            return {
                ...state,
                data: action.payload
            };

        case 'METRICAS_ERROR':
            return {
                ...state,
                error: {
                    ...state.error,
                    metricas: action.payload
                }
            };



        default:
            return state; 
    };

};