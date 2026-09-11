import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataMetricasAlumno } from "../data/metricas.alumnos.data";
import { method as dataFlayer } from "../data/flayer.data";

import { EscuelaAlumnoRow, ClaseHoyRow, EscuelaData, InscripcionActualData, PlanEscuelaData,  HorarioClaseData} from "../data/metricas.alumnos.data";
import { MetricasAlumnoSchema, MetricasAlumnosInputs,
         DataEscuelaInputs, DataEscuelaSchema,
         IdEscuelaInputs, IdEscuelaSchema,
 } from "../squemas/metricas.alumno"; 
import { TipadoData } from "../tipados/tipado.data";
import { FlayerDataResult  } from "../data/flayer.data";

export interface  RespuestaMetricasAlumnos {
     escuelas : EscuelaAlumnoRow[] | null | undefined ,
     clasesHoy : ClaseHoyRow[] |null | undefined ,
     flayers  : FlayerDataResult[] | null | undefined, // por el momento 
};


const metricasAlumnoPrincipal = async ( data : MetricasAlumnosInputs)
: Promise<TipadoData<RespuestaMetricasAlumnos>> => {

    const correoValidado : MetricasAlumnosInputs = MetricasAlumnoSchema.parse( data );

    const validarCorreo = await dataMetricasAlumno.obtenerDniAlumno( correoValidado.correo);

    if ( validarCorreo.code === "DNI_ALUMNO_NO_EXISTE"){
        return {
            error : true,
            message : "Correo no valido, verificar en servidor.",
            code : "CORREO_INVALIDO_SERVIDOR" // ESTO ES ASI POR Q SI O SI TENDRIA Q TENER CORREO ASOCIADO A UN DNI
        };
    }
    
    const dni = validarCorreo.data?.dni_alumno ? validarCorreo.data?.dni_alumno : 0
    
    const [respuestaMetricas, respuestaClasesHoy, respuestaFlayers] = await Promise.all([
            dataMetricasAlumno.obtenerEscuelasPorAlumno(dni),
            dataMetricasAlumno.obtenerClasesEscuelasHoy(dni),
            dataFlayer.getFlayerAlumnos(dni)
        ]);



    const metricasAlumnos : EscuelaAlumnoRow[] | null | undefined  = respuestaMetricas.code === 'METRICAS_ESCEULAS_ALUMNOS_LISTED'
                             ? respuestaMetricas.data
                             : null 
      
    const clasesHoy : ClaseHoyRow[] |  null | undefined   = respuestaClasesHoy.code === "METRICAS_CLASES_HOY_LISTED" 
                             ? respuestaClasesHoy.data
                             : null                            
   
    const flayers : FlayerDataResult[] | null | undefined  = respuestaFlayers.code === "GET_FLAYERS_LISTED"
                             ? respuestaFlayers.data
                             : null;    
    
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


export interface ResultInfoEscuela {

    heroEscuela : EscuelaData | null | undefined,
    flayer : FlayerDataResult[] | null | undefined,
    inscripcion :InscripcionActualData | null | undefined,
    planes :  PlanEscuelaData[] | null | undefined

};

const dataEscuelaServicio = async ( data : DataEscuelaInputs )
:Promise<TipadoData<ResultInfoEscuela>> =>{

    const validarData : DataEscuelaInputs = DataEscuelaSchema.parse( data);


    const validarCorreo = await dataMetricasAlumno.obtenerDniAlumno( validarData.correo);

    if ( validarCorreo.code === "DNI_ALUMNO_NO_EXISTE"){
        return {
            error : true,
            message : "Correo no valido, verificar en servidor.",
            code : "CORREO_INVALIDO_SERVIDOR" // ESTO ES ASI POR Q SI O SI TENDRIA Q TENER CORREO ASOCIADO A UN DNI
        };
    }

    const dataInscripcion ={
        ...validarData,
        dni_alumno : validarCorreo.data?.dni_alumno,
    };

    const [ infoEscuela , infoFlayers, infoInscripcion, infoPlanes ] = await Promise.all([
         dataMetricasAlumno.dataEscuela( validarData.id_escuela),
         dataFlayer.getFlayerEscuela( validarData.id_escuela),
         dataMetricasAlumno.inscripcionActual(dataInscripcion),
         dataMetricasAlumno.planesActivos(validarData.id_escuela)   
    ]);
    

    const heroEscuela : EscuelaData | null | undefined = infoEscuela.code === 'DATA_ESCUELA_EXISTE'
                        ? infoEscuela.data
                        : null ;  

    const flayerEscuela : FlayerDataResult[] | null | undefined = infoFlayers.code === 'GET_FLAYERS_LISTED'
                        ? infoFlayers.data
                        : null ;

    const inscripcion : InscripcionActualData | null | undefined = infoInscripcion.code === 'INSCRIPCION_ACTUAL_EXISTE'
                        ? infoInscripcion.data
                        : null ;                   

    const planes : PlanEscuelaData[] | null | undefined = infoPlanes.code === 'PLANES_ACTIVOS_LISTED'
                        ? infoPlanes.data
                        : null ;


    if ( heroEscuela !== undefined || flayerEscuela !== undefined || inscripcion !== undefined || planes !== undefined ){
        return {
            error : false,
            message : "Data de escuela obtenida correctamente.",
            code : "DATA_ESCUELA_OK",
            data :{
                heroEscuela : heroEscuela,
                flayer : flayerEscuela,
                inscripcion : inscripcion,
                planes : planes 
            }
        };
    };                    
    
    return {
        error: true, 
        message : "Error en el servidor, Data de escuela.",
        code : "ERROR_SERVIDOR"
    };                         

};


const horarioEscuelaServicio = async ( data : IdEscuelaInputs)
:Promise<TipadoData<HorarioClaseData[] | null >> =>{

    const validarData  : IdEscuelaInputs = IdEscuelaSchema.parse(data);

    const resultHorario = await dataMetricasAlumno.horarioEscuela(validarData.id_escuela);
    const infoHorario :  HorarioClaseData[] | null | undefined  = resultHorario.code === 'HORARIO_ESCUELA_LISTED' 
                        ?  resultHorario.data
                        : null;

    if ( infoHorario !== undefined ){
        return {
            error : false, 
            message : "Horario de escuela ok.",
            data : infoHorario,
            code : "HORARIO_ESCUELA_OK"
        };
    }; 

    return {
        error: true, 
        message : "Error en el servidor, Horarios escuela.",
        code : "ERROR_SERVIDOR"
    };     

};

export const method = {

    metricasAlumnoPrincipal : tryCatchDatos( metricasAlumnoPrincipal ),
    dataEscuelaServicio : tryCatchDatos( dataEscuelaServicio),
    horarioEscuelaServicio : tryCatchDatos( horarioEscuelaServicio),

};