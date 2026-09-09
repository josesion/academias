import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioMetricasAlumno } from "../Servicio/metricas.alumnos.servicios";

import { MAPA_METRICAS_ALUMNOS, MAPA_INFO_ESCUELA } from "../respuestas/metricas.alumno";
import { RespuestaMetricasAlumnos, ResultInfoEscuela } from "../Servicio/metricas.alumnos.servicios";
import { DataEscuelaInputs, MetricasAlumnosInputs } from "../squemas/metricas.alumno";


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
        id_escuela :Number(req.usuario?.id_escuela),
        correo : req.params.correo,
    };

   await handleControladores<DataEscuelaInputs, ResultInfoEscuela>(
        res, data, servicioMetricasAlumno.dataEscuelaServicio, MAPA_INFO_ESCUELA
   );

};


export const method = {

    metricasPrincipal : tryCatch( metricasPrincipal ),
    dataEscuelaAlumno : tryCatch( dataEscuelaAlumno),

};
