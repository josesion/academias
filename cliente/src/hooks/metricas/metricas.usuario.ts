import { useEffect, useReducer } from "react";
import { initialStateMetricas, metricasReducer,type MetricaAction } from "../../reducers/metricasReducer";
import { useEffectServicio } from "../../utils/useEfectServicio";
import { useActualizarAlEnfocar } from "../../utils/useActulizarFocus";
import { recepcionComunicacion } from "../../utils/canalComunicacion";

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
        useAbort : true,
        dependencias : [state.actualizarTajetas, state.actualizarCierreCaja, state.actualizarGeneral]
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
        useAbort : true,

        dependencias : [state.actualizar, state.actualizarGeneral]
        //YA SE VERAN LAS DEPENDECINAS
    }); 

  // ---- listado para mostrar las tarjetas de historial administrativo
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
        useAbort : true,
        dependencias : [state.actualizarCierreCaja, state.actualizarGeneral]
    });     


/**
 * Configura un listener en un canal de comunicación para sincronizar 
 * el módulo de asistencia en tiempo real.
 * 
 * Escucha el mensaje "ACTUALIZAR" y, al recibirlo, ejecuta las acciones 
 * correspondientes en el reducer para refrescar los datos de asistencia o 
 * manejar posibles errores. Al desmontar el componente, cancela la 
 * suscripción para evitar pérdidas de rendimiento o fugas de memoria.
 */
    useEffect(() => {

        const unsubscribe = recepcionComunicacion({
            nombreCanal: "canal_actualizar_metricas_asistencia",
            mensaje: "ACTUALIZAR",
            dispatchError: dispatch,
            error: "SET_ERROR_ACTUALIZAR",
            dispatchActualizar: dispatch,
            actualizar: "SET_ACTUALIZAR_ASISTENCIA"
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

 /**
 * Configura un listener mediante un canal de comunicación para sincronizar 
 * el panel principal en tiempo real. 
 * 
 * Escucha el mensaje "ACTUALIZAR_PANEL_PRINCIPAL" y, al recibirlo, dispara 
 * acciones al reducer para refrescar las métricas de las tarjetas o manejar 
 * posibles errores. Al desmontarse el componente, limpia la suscripción 
 * para evitar fugas de memoria.
 */
    useEffect(() => {

        const unsubscribeTarjetas = recepcionComunicacion({
            nombreCanal: "canal_actualizar_metricas_principal",
            mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
            dispatchError: dispatch,
            error: "SET_ERROR_METRICAS_TARJETAS",
            dispatchActualizar: dispatch,
            actualizar:"SET_ACTUALIZAR_METRICAS_TARJETAS"
        });

        return () => {
            if (unsubscribeTarjetas) unsubscribeTarjetas();
        };
    }, []);


/**
 * Configura un listener en un canal de comunicación para mantener sincronizado 
 * el módulo de caja en tiempo real.
 * 
 * Escucha el mensaje "ACTUALIZAR_CIERRE" y, al recibirlo, dispara las acciones 
 * necesarias al reducer para refrescar los datos del cierre de caja o manejar 
 * cualquier error asociado. Al desmontarse el componente, limpia la suscripción 
 * para evitar fugas de memoria.
 */
    useEffect(() => {

        const cierreCaja = recepcionComunicacion({
            nombreCanal: "canal_actualizar_metricas_cierre",
            mensaje: "ACTUALIZAR_CIERRE",
            dispatchError: dispatch,
            error: 'SET_ERROR_METRICAS_CIERRE',
            dispatchActualizar: dispatch,
            actualizar:"SET_ACTUALIZAR_CIERRE"
        });

        return () => {
            if (cierreCaja) cierreCaja();
        };
    }, []);

    //Actualizacion por focus en la pantalla
    useActualizarAlEnfocar({ dispatchActualizar : dispatch, accion : "SET_ACTUALIZAR_GENERICO"});
    
    return{
        state
    };

};

