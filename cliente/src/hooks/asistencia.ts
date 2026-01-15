import { useState , useEffect, use } from "react";

import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";


type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface DataUseAsistenciaConfig{
    id_escuela : number,
    servicios : {
        asistenciaHorarios : ServicioCrud,
        registroAsistencia : ServicioCrud,
        obtenerDataAsistencia : ServicioCrud
    },

     inicalFiltroAlumno :{ dni_alumno  : string }
};

export const useAsistenciaLogica = ( config : DataUseAsistenciaConfig) =>{
// ──────────────────────────────────────────────────────────────
//Estados Asistencia
// ────────────────────────────────────────────────────────────── 
    const [errorGenerico , setErrorGenerico] = useState<string | null>(null);
    const [ exitoAsistencia , setExitoAsistencia ] = useState<boolean>( false );
    const [claseEnCurso , setClaseEnCurso] = useState<TipadoAsistencia.ResultadoClase_en_cursos>({ error : null , message: null , code : null});
    const [claseProxima , setClaseProxima ]= useState<TipadoAsistencia.ResultadoClase_proxima>({ error : null , message: null , code : null});
    const [dataInscripcion , setDataInscripcion] = useState<TipadoAsistencia.DataInscripcionVigente | null>(null);
    const [dataAsistencia , setDataAsistencia ] = useState<TipadoAsistencia.ResultDataAsistencia>( { 
        dataHorario : { error : null , message: null , code : null},
        dataInscripcion : { error : null , message: null , code : null}
    } );

    const [ registroAsistencia , setRegistroAsistencia] = useState<TipadoAsistencia.BusquedaAlumno>({
        ...config.inicalFiltroAlumno,
        estado : "activos",
        id_escuela : config.id_escuela
    });
// ──────────────────────────────────────────────────────────────
//Reseteo de los estados 
// ────────────────────────────────────────────────────────────── 
    const resetFormulario = () => {
        setRegistroAsistencia({
            ...config.inicalFiltroAlumno,
            estado : "activos",
            id_escuela : config.id_escuela
        });
        setDataAsistencia({
         dataHorario : { error : null , message: null , code : null},
         dataInscripcion : { error : null , message: null , code : null}           
        });
        setErrorGenerico(null);
        setDataInscripcion(null);
    } ;

// ──────────────────────────────────────────────────────────────
//Handles asistencia 
// ────────────────────────────────────────────────────────────── 
    const handleCachearAlumno = async(e: React.ChangeEvent<HTMLInputElement>) =>{
        const { name, value } = e.target;
        setRegistroAsistencia({
            ...registroAsistencia,
            [name] : value
        });

        if (name === "dni_alumno") {
                // El "Peaje": Solo si tiene entre 8 y 9 caracteres buscamos en la DB
            if (value.length >= 8 && value.length <= 9) {
                    const dataAsistenciafetch = config.servicios.obtenerDataAsistencia;
                    const resultado = await dataAsistenciafetch({id_escuela : config.id_escuela , dni_alumno : value, estado : registroAsistencia.estado});
                
                    setDataAsistencia(resultado.data);
                    if (resultado.code === "ASISTENCIA_OK"){
                        setDataAsistencia(resultado.data);
                        setDataInscripcion(resultado.data.dataInscripcion);
                    }else{
                        setDataAsistencia({
                            dataHorario : { error : true, message : resultado.message || "Error desconocido", code : resultado.code || "UNKNOWN_ERROR" },
                            dataInscripcion : { error : true, message : resultado.message || "Error desconocido", code : resultado.code || "UNKNOWN_ERROR" }
                        });
                        setErrorGenerico(resultado.message || "Error desconocido");
                        setDataInscripcion(null);
                    }
            } else {
                    // Si el DNI es muy corto (porque está borrando), limpiamos la info vieja
                   //console.log("no busco :", value);
                    setErrorGenerico(null);
                    setDataInscripcion(null);
                    setDataAsistencia({
                    dataHorario : { error : null , message: null , code : null},
                    dataInscripcion : { error : null , message: null , code : null}           
                    });
            };
      };
    };

    const handleResgistrarAsistencia = async() => {
// Verificamos que existan las propiedades antes de usarlas
        if ("id_horario_clase" in dataAsistencia.dataHorario && 
            "id_inscripcion" in dataAsistencia.dataInscripcion) {

            const registrarAsistenciaFetch = config.servicios.registroAsistencia;
            const dataAsistenciaData = {
                id_escuela : config.id_escuela,
                dni_alumno : registroAsistencia.dni_alumno,
                estado     : registroAsistencia.estado,
                id_horario_clase : dataAsistencia.dataHorario.id_horario_clase,
                id_inscripcion   : dataAsistencia.dataInscripcion.id_inscripcion                
            };
            console.log("Datos para registrar asistencia :", dataAsistenciaData);
  
            const registroAsistenciaResultado =  await registrarAsistenciaFetch( dataAsistenciaData );

            console.log(registroAsistenciaResultado);
            if ( registroAsistenciaResultado.code === "ASISTENCIA_OK"){
                resetFormulario();
                setExitoAsistencia( true );
                setTimeout(() => {
                    setExitoAsistencia( false );
                }, 3000);
            }else{
                setErrorGenerico(registroAsistenciaResultado.message || "Error desconocido");
            };

        } else {
           // console.error("No se puede registrar: Datos incompletos o error presente");
            setErrorGenerico("No se puede registrar: Datos incompletos");
        }
    };
// ──────────────────────────────────────────────────────────────
//Efectos asistencia 
// ────────────────────────────────────────────────────────────── 

useEffect(()=>{

    const asistenciaFechas = async() =>{
        const data = { id_escuela : config.id_escuela , estado : "activos"};
        const servicioApiFetch = config.servicios.asistenciaHorarios;
        const asistenciaFechasRespuesta = await servicioApiFetch( data); 
       
        if (asistenciaFechasRespuesta.error === false){
            setClaseEnCurso(asistenciaFechasRespuesta.data.enCursoClase);
            setClaseProxima(asistenciaFechasRespuesta.data.proximaClase);
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
        errorGenerico,   
        exitoAsistencia, 
        claseEnCurso,
        claseProxima,
        registroAsistencia,
        dataInscripcion,
        handleCachearAlumno,
        handleResgistrarAsistencia
    }
};

