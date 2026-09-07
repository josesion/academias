import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioMetricasAlumno } from "../Servicio/metricas.alumnos.servicios";
import { MAPA_METRICAS_ALUMNOS } from "../respuestas/metricas.alumno";
import { RespuestaMetricasAlumnos } from "../Servicio/metricas.alumnos.servicios";

const metricasPrincipal = async ( req : Request , res : Response ) =>{
    const { correo } = req.params;

    const data = {
        correo : correo,
    };
    await handleControladores<{ correo : string }, RespuestaMetricasAlumnos>(
        res, data , servicioMetricasAlumno.metricasAlumnoPrincipal , MAPA_METRICAS_ALUMNOS
    );

};


export const method = {

    metricasPrincipal : tryCatch( metricasPrincipal ),

};
