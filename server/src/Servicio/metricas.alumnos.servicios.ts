import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataMetricasAlumno } from "../data/metricas.alumnos.data";

import { EscuelaAlumnoRow, ClaseHoyRow } from "../data/metricas.alumnos.data";
import { MetricasAlumnoSchema, MetricasAlumnosInputs } from "../squemas/metricas.alumno"; 
import { TipadoData } from "../tipados/tipado.data";

export interface  RespuestaMetricasAlumnos {
     escuelas : EscuelaAlumnoRow[] | null | undefined ,
     clasesHoy : ClaseHoyRow[] |null | undefined ,
     flayers  : null // por el momento 
};


const metricasAlumnoPrincipal = async ( data : MetricasAlumnosInputs)
: Promise<TipadoData<RespuestaMetricasAlumnos>> => {

    const dniValidado : MetricasAlumnosInputs = MetricasAlumnoSchema.parse( data );


    const [respuestaMetricas, respuestaClasesHoy] = await Promise.all([
            dataMetricasAlumno.obtenerEscuelasPorAlumno(dniValidado.dni_alumno),
            dataMetricasAlumno.obtenerClasesEscuelasHoy(dniValidado.dni_alumno),
        ]);

    // ACA SE AGREGARA LA INFO DE LOS FLAYERS PARA EL ALUNNO
    const metricasAlumnos : EscuelaAlumnoRow[] | null | undefined  = respuestaMetricas.code === 'METRICAS_ESCEULAS_ALUMNOS_LISTED'
                             ? respuestaMetricas.data
                             : null 
      
    const clasesHoy : ClaseHoyRow[] |  null | undefined   = respuestaClasesHoy.code === "METRICAS_CLASES_HOY_LISTED" 
                             ? respuestaClasesHoy.data
                             : null                            
   
    const flayers = null ;    
    
    if (!respuestaMetricas.error || !respuestaClasesHoy.error) {
            return {
                error: false,
                message: "Métricas obtenidas correctamente.",
                code: "METRICAS_PRINCIPALES_OK",
                data: {
                    escuelas: metricasAlumnos,
                    clasesHoy: clasesHoy,
                    flayers: flayers
                }
            };
    } ;         
                        
    return {
        error: true, 
        message : "Error en el servidor, metricas alumnos.",
        code : "ERROR_SERVIDOR"
    };                         
};


export const method = {

    metricasAlumnoPrincipal : tryCatchDatos( metricasAlumnoPrincipal ),

};