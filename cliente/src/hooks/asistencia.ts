import {  useEffect , useReducer} from "react";
import { initialState, asistenciaReducer} from "../reducers/asistenciaReducer";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface DataUseAsistenciaConfig{
    servicios : {
        asistenciaHorarios : ServicioCrud,
        registroAsistencia : ServicioCrud,
        obtenerDataAsistencia : ServicioCrud,
    },

     inicalFiltroAlumno :{ dni_alumno  : string }
};

export const useAsistenciaLogica = ( config : DataUseAsistenciaConfig) =>{

    const [ state , dispatch] = useReducer( asistenciaReducer, initialState());

// ──────────────────────────────────────────────────────────────
//Handles asistencia 
// ────────────────────────────────────────────────────────────── 

    const handleCachearAlumno = async(e: React.ChangeEvent<HTMLInputElement>) =>{
        const { name, value } = e.target;

        dispatch({ type : "SET_REGISTRO_ASISTENCIA", payload : { ...state.registroAsistencia, [name] : value }})

        if (name === "dni_alumno") {
                // El "Peaje": Solo si tiene entre 8 y 9 caracteres buscamos en la DB
            if (value.length >= 8 && value.length <= 9) {
                   const dataAsistenciafetch = config.servicios.obtenerDataAsistencia;
                   const resultado = await dataAsistenciafetch({  dni_alumno : value, estado : state.registroAsistencia.estado});

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
                    // Si el DNI es muy corto (porque está borrando), limpiamos la info vieja

                    dispatch({ type : "SET_PEAJE_RESET" });
            };
      };
    };

    const handleResgistrarAsistencia = async() => {
// Verificamos que existan las propiedades antes de usarlas
        if ("id_horario_clase" in state.dataAsistencia.dataHorario && 
            "id_inscripcion" in state.dataAsistencia.dataInscripcion) {

            const registrarAsistenciaFetch = config.servicios.registroAsistencia;
            const dataAsistenciaData = {
                dni_alumno : state.registroAsistencia.dni_alumno,
                estado     : state.registroAsistencia.estado,
                id_horario_clase : state.dataAsistencia.dataHorario.id_horario_clase,
                id_inscripcion   : state.dataAsistencia.dataInscripcion.id_inscripcion                
            };
  
            const registroAsistenciaResultado =  await registrarAsistenciaFetch( dataAsistenciaData );

            if ( registroAsistenciaResultado.code === "ASISTENCIA_OK"){
                dispatch({ type : "SET_REGISTRO_ASISTENCIA_OK" });   
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




    return{
        state,
        handleCachearAlumno,
        handleResgistrarAsistencia
    }
};

