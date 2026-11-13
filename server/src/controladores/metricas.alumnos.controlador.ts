import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioMetricasAlumno } from "../Servicio/metricas.alumnos.servicios";

import { MAPA_METRICAS_ALUMNOS, MAPA_INFO_ESCUELA, MAPA_HORARIO_ESCUELA, MAPA_ASISTENCIAS_INSCRIPCION } from "../respuestas/metricas.alumno";
import { RespuestaMetricasAlumnos, ResultInfoEscuela } from "../Servicio/metricas.alumnos.servicios";
import { HorarioClaseData, AsistenciaInscripcionRow } from "../data/metricas.alumnos.data";
import { DataEscuelaInputs, MetricasAlumnosInputs, AsistenciasInscripcionInputs } from "../squemas/metricas.alumno";


const metricasPrincipal = async ( req : Request , res : Response ) =>{
    const { correo } = req.params;
   
    const data : MetricasAlumnosInputs = {
        correo : correo,
    };
    await handleControladores<MetricasAlumnosInputs, RespuestaMetricasAlumnos>(
        res, data , servicioMetricasAlumno.metricasAlumnoPrincipal , MAPA_METRICAS_ALUMNOS
    );

};


const dataEscuelaAlumno = async ( req : Request , res : Response ) =>{
    
    const data : DataEscuelaInputs = {
        id_escuela :Number(req.params.id_escuela),
        correo : req.params.correo,
    };

   await handleControladores<DataEscuelaInputs, ResultInfoEscuela>(
        res, data, servicioMetricasAlumno.dataEscuelaServicio, MAPA_INFO_ESCUELA
   );

};


const horarioEscuela = async ( req : Request , res : Response ) =>{

    const data  = {
        id_escuela :Number(req.params.id_escuela),
    };    

    await handleControladores<{id_escuela: number }, HorarioClaseData[] | null>(
        res, data, servicioMetricasAlumno.horarioEscuelaServicio ,MAPA_HORARIO_ESCUELA
    );
};


/**
 * Controlador del historial de asistencias de una inscripción.
 *
 * El `id_inscripcion` viaja por params como texto y el controlador lo pasa
 * a `Number()`: un valor no numérico da `NaN` y lo frena el Zod del
 * Servicio con un 400 (Zod solo vive en la capa Servicio).
 *
 * @param {Request} req - Petición con `params.id_inscripcion`.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta vía `handleControladores`.
 */
const asistenciasInscripcion = async ( req : Request , res : Response ) =>{

    const data : AsistenciasInscripcionInputs = {
        id_inscripcion : Number(req.params.id_inscripcion),
    };

    await handleControladores<AsistenciasInscripcionInputs, AsistenciaInscripcionRow[] | null>(
        res, data, servicioMetricasAlumno.asistenciasInscripcionServicio , MAPA_ASISTENCIAS_INSCRIPCION
    );
};






export const method = {

    metricasPrincipal : tryCatch( metricasPrincipal ),
    dataEscuelaAlumno : tryCatch( dataEscuelaAlumno),
    horarioEscuela : tryCatch(horarioEscuela),
    asistenciasInscripcion : tryCatch( asistenciasInscripcion ),

};
