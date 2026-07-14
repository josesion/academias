import { Request , Response } from "express";
import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

import { CodigoEstadoHTTP } from "../tipados/generico";
import { method as servicioMetrica } from "../Servicio/metricas.servicio";
import { MAPA_METRICAS_TARJETAS, ERROR_INTERNO_SERVIDOR,
         MAPA_METRICAS_CLASES,
 } from "../respuestas/metricas";


const metricaInscripcion = async( req : Request , res : Response ) => {
    
    const data = { id_escuela : req.usuario?.id_escuela };

    const resultMetricas = await servicioMetrica.metricasInscripcion( data );
 

    const config = MAPA_METRICAS_TARJETAS[ resultMetricas.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            resultMetricas.message || config.msg,
            resultMetricas.data,
            undefined,
            resultMetricas.code
        );
    }else{
        return enviarResponseError(
            res, 
            config.status,
            resultMetricas.message || config.msg,
            resultMetricas.code
        );
    };  

};

const encabezadoClases = async ( req : Request , res : Response ) =>{

    const data = { id_escuela : req.usuario?.id_escuela };
    const resultMetrica = await servicioMetrica.encabezadoClases( data );

    const config = MAPA_METRICAS_CLASES[ resultMetrica.code ] || ERROR_INTERNO_SERVIDOR;

    if ( config.status === CodigoEstadoHTTP.OK){
        return enviarResponse(
            res,
            config.status,
            resultMetrica.message || config.msg,
            resultMetrica.data,
            undefined,
            resultMetrica.code
        );
    }else{
        return enviarResponseError(
            res, 
            config.status,
            resultMetrica.message || config.msg,
            resultMetrica.code
        );
    }; 

};

const asistenciaClases = async (  req : Request , res : Response  ) =>{
    
     const data = { id_escuela : req.usuario?.id_escuela };
     
     const resultMetrica = await servicioMetrica.asistenciaClases( data );

};


export const method = {
    metricaInscripcion : tryCatch( metricaInscripcion ),
    encabezadoClases   : tryCatch( encabezadoClases),
    asistenciaClases   : tryCatch( asistenciaClases )
};