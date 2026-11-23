import { useEffect , useReducer, useContext} from "react";
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { useActualizarAlEnfocar } from "../utils/useActulizarFocus";

import { initialState, asistenciaReducer} from "../reducers/asistenciaReducer";
import { initialStateMetricas, metricasReducer } from "../reducers/metricasReducer";

import { peticionComunicacion } from "../utils/canalComunicacion";
import type * as TipadoAsistencia from "../tipadosTs/asistencia.typado";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface DataUseAsistenciaConfig{
    servicios : {
        asistenciaHorarios : ServicioCrud,
        registroAsistencia : ServicioCrud,
        obtenerDataAsistencia : ServicioCrud,
    },

     inicalFiltroAlumno :{ pin_asistencia  : string }
};

export const useAsistenciaLogica = ( config : DataUseAsistenciaConfig) =>{
    const { rol }  = useContext(RutasProtegidasContext);

    const [ sateMetrica, disparchMetricas] = useReducer( metricasReducer, initialStateMetricas());
    const [ state , dispatch] = useReducer( asistenciaReducer, initialState());



    
// ──────────────────────────────────────────────────────────────
//Handles asistencia 
// ────────────────────────────────────────────────────────────── 

    const handleCachearAlumno = async(e: React.ChangeEvent<HTMLInputElement>) =>{
        const { name, value } = e.target;

        dispatch({ type : "SET_REGISTRO_ASISTENCIA", payload : { ...state.registroAsistencia, [name] : value }})

        if (name === "pin_asistencia") {
                // El "Peaje": Solo si tiene 4 dígitos buscamos en la DB
            if (value.length === 4) {
                   const dataAsistenciafetch = config.servicios.obtenerDataAsistencia;
                   const resultado = await dataAsistenciafetch({  pin_asistencia : value, estado : state.registroAsistencia.estado});

                   if (resultado.code === "ASISTENCIA_OK"){
            
                        dispatch({ type : "SET_ASISTENCIA_OK", payload : { 
                            dataAsistencia : resultado.data , 
                            dataInscripcion : resultado.data.dataInscripcion, 
                            errorGenerico : null} });

                    }else{
                        dispatch({ type : "SET_ASISTENCIA_FALLO", payload : {
                             dataAsistencia : {
                                    dataHorario : { error : true, message : resultado.message || "Error desconocido", code : resultado.code || "UNKNOWN_ERROR" },
                                    dataInscripcion : { error : true, message : resultado.message || "Error desconocido", code : resultado.code || "UNKNOWN_ERROR" }
                             },
                             erroGenerico : resultado.message || "Error desconocido" ,
                             dataInscripcion : null
                        }}); 
                    };
            } else {
                    // Si el PIN no tiene 4 dígitos, limpiamos la info vieja

                    dispatch({ type : "SET_PEAJE_RESET" });
            };
      };
    };

    const handleResgistrarAsistencia = async() => {
// Obtener el id_horario_clase: si hay selección explícita, usarla;
// si hay un solo horario, usar ese; si no, error.
        const horarios = state.dataAsistencia.dataHorario;
        let idHorarioClase : number | undefined;

        if (Array.isArray(horarios) && horarios.length > 0) {
            const listaHorarios = horarios as TipadoAsistencia.DataHorarioAsistencia[];
            if (state.claseSeleccionada != null) {
                // El usuario eligió una clase
                const seleccionado = listaHorarios.find(h => h.id_horario_clase === state.claseSeleccionada);
                if (seleccionado) {
                    idHorarioClase = seleccionado.id_horario_clase;
                }
            } else if (listaHorarios.length === 1) {
                // Solo hay una clase, usarla
                idHorarioClase = listaHorarios[0].id_horario_clase;
            }
            // Si hay múltiples y no hay selección, no se puede registrar
        } else if ("id_horario_clase" in state.dataAsistencia.dataHorario) {
            // Fallback: dataHorario es un objeto único (caso antiguo)
            const dataHorarioObj = state.dataAsistencia.dataHorario as unknown as TipadoAsistencia.DataHorarioAsistencia;
            idHorarioClase = dataHorarioObj.id_horario_clase;
        }

        if (idHorarioClase == null) {
            dispatch({ type : "SET_ERROR_GENERICO", payload : "Seleccioná la clase a la que querés asistir" });
            return;
        }

        if ("id_inscripcion" in state.dataAsistencia.dataInscripcion) {

            const registrarAsistenciaFetch = config.servicios.registroAsistencia;
            const dataAsistenciaData = {
                pin_asistencia : state.registroAsistencia.pin_asistencia,
                dni_alumno     : state.dataAsistencia.dataInscripcion.dni_alumno,
                estado         : state.registroAsistencia.estado,
                id_horario_clase : idHorarioClase,
                id_inscripcion   : state.dataAsistencia.dataInscripcion.id_inscripcion                
            };
  
            const registroAsistenciaResultado =  await registrarAsistenciaFetch( dataAsistenciaData );

            if ( registroAsistenciaResultado.code === "ASISTENCIA_OK"){
                dispatch({ type : "SET_REGISTRO_ASISTENCIA_OK" }); 
                // mando la senal para otra pestana 
                peticionComunicacion({
                    nombreCanal : "canal_actualizar_metricas_asistencia",
                    mensaje : "ACTUALIZAR",
                    dispatchError : disparchMetricas,
                    error :  'SET_ERROR_ACTUALIZAR',
                });

                setTimeout(() => {
                         dispatch({ type : "SET_EXITOSA_ASISTENCIA" , payload : false });
                }, 3000);
            }else{
                dispatch({ type : "SET_ERROR_GENERICO", payload : registroAsistenciaResultado.message || "Error desconocido" });
            };

        } else {
           dispatch({ type : "SET_ERROR_GENERICO", payload : "No se puede registrar: Datos incompletos" }); 
        }
    };
// ──────────────────────────────────────────────────────────────
//Efectos asistencia 
// ────────────────────────────────────────────────────────────── 

useEffect(()=>{

    const asistenciaFechas = async() =>{
        const data = {  estado : "activos"};
        const servicioApiFetch = config.servicios.asistenciaHorarios;
        const asistenciaFechasRespuesta = await servicioApiFetch( data); 
        console.log("Kisoco asistencia",asistenciaFechasRespuesta)
        if (asistenciaFechasRespuesta.error === false){

            dispatch({ type : "SET_CARTELES_OK", payload : {
                claseEnCurso : asistenciaFechasRespuesta.data.enCursoClase,
                claseProxima : asistenciaFechasRespuesta.data.proximaClase
            } });
        };
    }

    asistenciaFechas();

    // CONFIGURAMOS EL INTERVALO
    const intervalo = setInterval(() => {
      //  console.log("Refresco automático cada 1 min");
        asistenciaFechas(); // No hace falta cambiar el estado aquí, llamamos a la función directo
 
    }, 60000); // 1 minuto

    // LIMPIEZA
    return () => clearInterval(intervalo);

},[]);


useEffect(()=>{
    dispatch({ type : "SET_NOMBRE_ESCUELA", payload : rol?.razon_social ? rol.razon_social : "-" })
},[state.actualizar])

    useActualizarAlEnfocar({dispatchActualizar : dispatch, accion : "SET_ACTUALIZAR"  }); 

    const handleSeleccionarClase = (idHorarioClase: number) => {
        dispatch({ type : "SET_CLASE_SELECCIONADA", payload : idHorarioClase });
    };

    return{
        state,
        handleCachearAlumno,
        handleResgistrarAsistencia,
        handleSeleccionarClase
    }
};

