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

    const correoValidado : MetricasAlumnosInputs = MetricasAlumnoSchema.parse( data );

    const validarCorreo = await dataMetricasAlumno.obtenerDniAlumno( correoValidado.correo);
    console.log(validarCorreo)

    if ( validarCorreo.code === "DNI_ALUMNO_NO_EXISTE"){
        return {
            error : true,
            message : "Correo no valido, verificar en servidor.",
            code : "CORREO_INVALIDO_SERVIDOR" // ESTO ES ASI POR Q SI O SI TENDRIA Q TENER CORREO ASOCIADO A UN DNI
        };
    }
    
    const dni = validarCorreo.data?.dni_alumno ? validarCorreo.data?.dni_alumno : 0
    console.log(dni)
    const [respuestaMetricas, respuestaClasesHoy] = await Promise.all([
            dataMetricasAlumno.obtenerEscuelasPorAlumno(dni),
            dataMetricasAlumno.obtenerClasesEscuelasHoy(dni),
        ]);

        console.log(respuestaMetricas)
        console.log(respuestaClasesHoy)
    // ACA SE AGREGARA LA INFO DE LOS FLAYERS PARA EL ALUNNO
    const metricasAlumnos : EscuelaAlumnoRow[] | null | undefined  = respuestaMetricas.code === 'METRICAS_ESCEULAS_ALUMNOS_LISTED'
                             ? respuestaMetricas.data
                             : null 
      
    const clasesHoy : ClaseHoyRow[] |  null | undefined   = respuestaClasesHoy.code === "METRICAS_CLASES_HOY_LISTED" 
                             ? respuestaClasesHoy.data
                             : null                            
   
    const flayers = null ;    
    
    if (  metricasAlumnos !== undefined || clasesHoy !== undefined) {
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