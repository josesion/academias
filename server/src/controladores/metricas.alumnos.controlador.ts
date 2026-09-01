import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioMetricasAlumno } from "../Servicio/metricas.alumnos.servicios";
import { MAPA_METRICAS_ALUMNOS } from "../respuestas/metricas.alumno";
import { RespuestaMetricasAlumnos } from "../Servicio/metricas.alumnos.servicios";

const metricasPrincipal = async ( req : Request , res : Response ) =>{

    const data = {
        dni_alumno : Number(req.body.dni_alumno),
    };
    await handleControladores<{dni_alumno : number }, RespuestaMetricasAlumnos>(
        res, data , servicioMetricasAlumno.metricasAlumnoPrincipal , MAPA_METRICAS_ALUMNOS
    );

};


export const method = {

    metricasPrincipal : tryCatch( metricasPrincipal ),

};

