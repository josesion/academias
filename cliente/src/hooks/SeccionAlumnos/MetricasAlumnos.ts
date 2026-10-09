import { useReducer,  } from "react";
import { initialMetricasAlumno, MetricasAlumnosReducer, type MetricasAlumnosAction } from "../../reducers/metricas.alumnos";

import { useEffectServicio } from "../../utils/useEfectServicio";

import type { RespuestaMetricasAlumnos } from "../../servicio/principal.alumnos.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface MetricasAlumnosProps {
    usuario : string,
    servicios : {
        alumnosEscuelas : ServicioCrud,
    }
};


export const metricasAlumnos = ( config : MetricasAlumnosProps) =>{

    const [ state , dispatch] = useReducer(MetricasAlumnosReducer, initialMetricasAlumno() );

/**
    Efecto para traer las escuelas , clases y flayers  de las escuelas en las q se anoto el alumno
*/    
    useEffectServicio<{ correo: string }, RespuestaMetricasAlumnos , MetricasAlumnosAction >({
        servicios : config.servicios.alumnosEscuelas,
        valores :{correo: config.usuario || ""},
        dispatch : dispatch,
        accionResultado : (data) =>({ type : "METRICAS_EXITO" , payload  : data}),
        accionCarga     : ( carga ) =>({ type : "METRICAS_CARGA" , payload : carga}),
        accionError     : ( mensaje ) => ({ type : "METRICAS_ERROR", payload : mensaje}),
        useAbort : true,
        dependencias : [config.usuario]
    });
       
    return {
        state
    };
}