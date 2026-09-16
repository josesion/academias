import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { generarFechasSuscripcion } from "../utils/fechasSuscripcion";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioSuspcripcion } from "../Servicio/suscripcion.escuela.servicios";

import { SuscripcionInputs } from "../squemas/suscripciones.escuela";
import { MAPA_POST_SUSCRIPCION } from "../respuestas/suscripcion.escuela";


const postSuscripcion = async ( req : Request , res : Response) =>{
    console.log(req.usuario)
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

export const method = {
    postSuscripcion : tryCatch( postSuscripcion ),
}