import { Request, Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioPlanesSass } from "../Servicio/planes.saas.servicios"; 
import { PlanSaasInputs } from "../squemas/planes.saas";
import { ResultPostPlanesSass } from "../data/planes.saas.data";
import { MAPA_POST_PLANES_SAAS } from "../respuestas/planes.saas";


const postPlanesSaas = async( req: Request, res: Response) =>{

    const data: PlanSaasInputs = {
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        precio: Number(req.body.precio),
        cant_flyers: Number(req.body.cant_flyers),
        estado: req.body.estado
    };

    await handleControladores<PlanSaasInputs,ResultPostPlanesSass >(
        res, data, servicioPlanesSass.postPlanesSaas,MAPA_POST_PLANES_SAAS
    );

};

export const method = {
    postPlanesSaas : tryCatch( postPlanesSaas)
}