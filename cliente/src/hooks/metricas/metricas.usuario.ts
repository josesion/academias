import { useReducer } from "react";
import { initialStateMetricas, metricasReducer,type MetricaAction } from "../../reducers/metricasReducer";
import { useEffectServicio } from "../../utils/useEfectServicio";

import type { ResultTarjeta, ResultClase, ResultAsistencia } from "../../servicio/metrica.fetch";
import { type ResultHistorial } from "../../servicio/historial.fetch";

type ServicioCrud = (data?: any, signal?: AbortSignal) => Promise<any>;

interface MetricasConfig {
    servicios : {
        tarjetas : ServicioCrud,
        clases   : ServicioCrud,
        asistencia : ServicioCrud,
        historial  : ServicioCrud,
    },
};
 

export const metricasUsuarioLogica = ( config : MetricasConfig ) =>{

    const [ state , dispatch] = useReducer( metricasReducer, initialStateMetricas());    
    const tarjetas = config.servicios.tarjetas; // Serivicio que obtiene las metricas de las tarjetas
    const clases   = config.servicios.clases;
    const asistencia = config.servicios.asistencia;
    const historial  = config.servicios.historial;

    //---- metricas de tarjeras 
    useEffectServicio<undefined,ResultTarjeta,MetricaAction >({
        servicios : tarjetas,
        dispatch : dispatch,
        accionResultado: (data) => ({
            type: "SET_TARJETAS",
            payload: data,
        }),

        accionCarga: (estado) => ({
            type: "SET_CARGA_TARJETA",
            payload: estado,
        }),

        accionError: (mensaje) => ({
            type: "SET_ERROR_TARJETA",
            payload: mensaje,
        }),
        useAbort : true
        //YA SE VERAN LAS DEPENDECINAS
    });
    //---- metrica de datos para la cebecera de clase
    useEffectServicio<undefined, ResultClase, MetricaAction>({
        servicios : clases,
        dispatch  : dispatch,
        accionResultado: (data) => ({
            type: "SET_CLASE",
            payload: data,
        }),

        accionCarga: (estado) => ({
            type: "SET_CARGA_CLASE",
            payload: estado,
        }),

        accionError: (mensaje) => ({
            type: "SET_ERROR_CLASE",
            payload: mensaje,
        }),
        useAbort : true
        //YA SE VERAN LAS DEPENDECINAS
    }); 
    // ---- listado de los alumnos q se encuentran tomando clases
    useEffectServicio<undefined, ResultAsistencia[], MetricaAction>({
        servicios : asistencia,
        dispatch  : dispatch,
        accionResultado: (data) => ({
            type: "SET_ASISTENCIA",
            payload: data,
        }),

        accionCarga: (estado) => ({
            type: "SET_CARGA_ASISNTECIA",
            payload: estado,
        }),

        accionError: (mensaje) => ({
            type: "SET_ERROR_ASISTENCIA",
            payload: mensaje,
        }),
        useAbort : true
        //YA SE VERAN LAS DEPENDECINAS
    }); 

    useEffectServicio<undefined, ResultHistorial[], MetricaAction>({
        servicios : historial,
        dispatch  : dispatch,
        accionResultado: (data) => ({
            type: "SET_HISTORIAL",
            payload: data,
        }),

        accionCarga: (estado) => ({
            type: "SET_CARGA_HISTORIAL",
            payload: estado,
        }),

        accionError: (mensaje) => ({
            type: "SET_ERROR_HISTORIAL",
            payload: mensaje,
        }),
        useAbort : true
        //YA SE VERAN LAS DEPENDECINAS
    });     

    return{
        state
    };

};

