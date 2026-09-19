import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioMetricasAlumno } from "../Servicio/metricas.alumnos.servicios";

import { MAPA_METRICAS_ALUMNOS, MAPA_INFO_ESCUELA, MAPA_HORARIO_ESCUELA } from "../respuestas/metricas.alumno";
import { RespuestaMetricasAlumnos, ResultInfoEscuela } from "../Servicio/metricas.alumnos.servicios";
import { HorarioClaseData } from "../data/metricas.alumnos.data";
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






export const method = {

    metricasPrincipal : tryCatch( metricasPrincipal ),
    dataEscuelaAlumno : tryCatch( dataEscuelaAlumno),
    horarioEscuela : tryCatch(horarioEscuela),

};
