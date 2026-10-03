import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { generarFechasSuscripcion } from "../utils/fechasSuscripcion";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioSuspcripcion } from "../Servicio/suscripcion.escuela.servicios";

import { SuscripcionInputs, FiltrosSuscripcionesInputs } from "../squemas/suscripciones.escuela";
import { MAPA_POST_SUSCRIPCION, MAPA_GET_SUSCRIPCION  } from "../respuestas/suscripcion.escuela";
import { SuscripcionEscuelaDto } from "../data/suscripcion.escuela.data";

const postSuscripcion = async ( req : Request , res : Response) =>{
    
    const {  fecha_inscripcion, fecha_vencimiento} = generarFechasSuscripcion();

    const data : SuscripcionInputs = {
        id_escuela : Number(req.body.id_escuela),
        id_plan_saas : Number(req.body.id_plan_saas),
        fecha_inscripcion : fecha_inscripcion ,
        fecha_vencimiento : fecha_vencimiento,
        estado : "activo"
    };

    await handleControladores< SuscripcionInputs, {}>(
        res, data , servicioSuspcripcion.postSuscripcion, MAPA_POST_SUSCRIPCION
    );
};


const getSupcripcion = async (req : Request , res : Response) =>{

    const data : FiltrosSuscripcionesInputs = {
        razon_social: typeof req.query.razon_social === "string" ? req.query.razon_social : undefined,
        id_plan_saas: typeof req.query.id_plan_saas === "string" ? req.query.id_plan_saas : undefined,
        fecha_inscripcion: typeof req.query.fecha_inscripcion === "string" ? req.query.fecha_inscripcion : undefined,
        estado: typeof req.query.estado === "string" ? req.query.estado : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        pagina: Number(req.query.pagina )
    };

    await handleControladores<FiltrosSuscripcionesInputs, SuscripcionEscuelaDto[]>(
        res, data, servicioSuspcripcion.getSuspcripciones, MAPA_GET_SUSCRIPCION 
    );
};    


export const method = {
    postSuscripcion : tryCatch( postSuscripcion ),
    getSupcripcion  : tryCatch( getSupcripcion )
}