import { useState , useEffect } from "react";




import  type * as TipadoAsistencia  from "../tipadosTs/asistencia.typado";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface DataUseAsistenciaConfig{
    id_escuela : number,
    servicios : {
        asistenciaHorarios : ServicioCrud
    },

     inicalFiltroAlumno :{ dni : string }
};

export const useAsistenciaLogica = ( config : DataUseAsistenciaConfig) =>{

    const [claseEnCurso , setClaseEnCurso] = useState<TipadoAsistencia.ResultadoClase_en_cursos>({ error : null , message: null , code : null});
    const [claseProxima , setClaseProxima ]= useState<TipadoAsistencia.ResultadoClase_proxima>({ error : null , message: null , code : null});

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
        console.log("Refresco automático cada 1 min");
        asistenciaFechas(); // No hace falta cambiar el estado aquí, llamamos a la función directo
    }, 60000); // 5 minutos

    // LIMPIEZA
    return () => clearInterval(intervalo);

},[]);

    return{
        claseEnCurso,
        claseProxima
    }
};

