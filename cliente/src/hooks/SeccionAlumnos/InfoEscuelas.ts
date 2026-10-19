import { useReducer } from "react";
import { initialInfoEscuela, InfoEscuelaReducer ,type  InfoEscuelaAction } from "../../reducers/infoEscuela";
import { useEffectServicio } from "../../utils/useEfectServicio";

import { type  ResultInfoEscuela } from "../../servicio/principal.alumnos.fetch";
import type { AsistenciaInscripcionRow } from "../../tipadosTs/asistencia.typado";
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface InfoEscuelaProps {
    usuario : string,
    servicios : {
        dataEscuela : ServicioCrud,
        horarioEscuela : ServicioCrud,
        asistenciasPorInscripcion : ServicioCrud,
    }
};


export const infoEscuelas = ( config : InfoEscuelaProps) =>{

    const [ state , dispatch] = useReducer(InfoEscuelaReducer, initialInfoEscuela() );

    const cerrarMensajeError = () =>{
        dispatch({ type : "SET_CERRAR_MODAL_ERROR" });
    };
 
    useEffectServicio<{ correo: string, id_escuela : number }, ResultInfoEscuela, InfoEscuelaAction>({
        servicios : config.servicios.dataEscuela,
        valores : {correo: config.usuario || "" , id_escuela : state.id_escuela || 0 },
        dispatch : dispatch,
        accionResultado : ( data ) => ({ type : "INFO_ESCUELA_OK" , payload : data }),
        accionCarga     : ( carga ) =>({ type : "SET_CARGA_INFO_ESCUELA", payload : carga}),
        accionError     : ( mensaje ) => ({ type : "SET_CARGA_ERROR" , payload : mensaje }),
        useAbort : true,
        dependencias : [state.id_escuela],
        enabled: Boolean(state.id_escuela)
    });

    useEffectServicio<{id_escuela : number}, any, InfoEscuelaAction>({
        servicios : config.servicios.horarioEscuela,
        valores : {id_escuela : state.id_escuela || 0},
        dispatch: dispatch,
        accionResultado : ( data ) =>({ type : "SET_HORARIO_ESCUELA", payload : data}),
        accionCarga     : ( carga ) =>({ type : "SET_CARGA_HORARIO", payload : carga }),
        accionError     : ( mensaje )=> ({ type : "SET_HORARIO_ERROR", payload : mensaje }),
        useAbort : true ,
        dependencias : [state.id_escuela],
        enabled: Boolean(state.id_escuela)
    });

    // Carga de clases asistidas por inscripción
    const idInscripcion = state.data?.inscripcion?.id_inscripcion ?? null;

    useEffectServicio<{ id_inscripcion: number }, AsistenciaInscripcionRow[], InfoEscuelaAction>({
        servicios: config.servicios.asistenciasPorInscripcion,
        valores: { id_inscripcion: idInscripcion ?? 0 },
        dispatch: dispatch,
        accionResultado: (data) => ({ type: "SET_CLASES_ASISTIDAS", payload: data ?? null }),
        accionCarga: (carga) => ({ type: "SET_CARGA_CLASES_ASISTIDAS", payload: carga }),
        accionError: (mensaje) => ({ type: "SET_ERROR_CLASES_ASISTIDAS", payload: mensaje }),
        useAbort: true,
        dependencias: [idInscripcion],
        enabled: Boolean(idInscripcion),
    });

    const abrirModalClases = () => {
        dispatch({ type: "SET_MODAL_CLASES_ASISTIDAS", payload: true });
    };

    const cerrarModalClases = () => {
        dispatch({ type: "SET_CERRAR_MODAL_CLASES" });
    };

    const reintentarClases = () => {
        dispatch({ type: "SET_CARGA_CLASES_ASISTIDAS", payload: true });
        dispatch({ type: "SET_ERROR_CLASES_ASISTIDAS", payload: null });
    };

    return{
        state,
        dispatch,
        cerrarMensajeError,
        abrirModalClases,
        cerrarModalClases,
        reintentarClases,
    };
};  