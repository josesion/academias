import { Request, Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioPlanesSass } from "../Servicio/planes.saas.servicios"; 
import { PlanSaasInputs, PlanDeletSaasInputs, FiltroPlanesInputs,  PlanEstadoSaasInputs } from "../squemas/planes.saas";
import { ResultPostPlanesSass, PlanSaasConId, PlanDelet, PlanSaasRow } from "../data/planes.saas.data";
import { MAPA_POST_PLANES_SAAS, MAPA_MOD_PLANES_SAAS, 
         MAPA_DELETE_PLANES_SAAS, MAPA_BAJAS_PLANES_SAAS,
         MAPA_LISTA_PLANES_SAAS
} from "../respuestas/planes.saas";


const postPlanesSaas = async( req: Request, res: Response) =>{

const data: PlanSaasInputs = {
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        precio: Number(req.body.precio),
        cant_flyers: Number(req.body.cant_flyers),
        estado: req.body.estado,
        // Si req.body.caracteristicas ya viene como objeto lo mandas directo, 
        // si viene como string de JSON, hacés un JSON.parse(). O si usas MySQL nativo/Prisma/Sequelize 
        // a veces se pasa directo el objeto. Acá te dejo cómo estructurarlo:
        caracteristicas: typeof req.body.caracteristicas === 'string' 
            ? JSON.parse(req.body.caracteristicas) 
            : req.body.caracteristicas
    };

    await handleControladores<PlanSaasInputs,ResultPostPlanesSass >(
        res, data, servicioPlanesSass.postPlanesSaas,MAPA_POST_PLANES_SAAS
    );

};


const modPlanesSass = async (req: Request, res: Response) =>{

const data: PlanSaasInputs = {
        id_plan: Number(req.params.id),
        tipo: req.body.tipo,
        descripcion: req.body.descripcion,
        precio: Number(req.body.precio),
        cant_flyers: Number(req.body.cant_flyers),
        estado: req.body.estado,
        caracteristicas: typeof req.body.caracteristicas === 'string' 
            ? JSON.parse(req.body.caracteristicas) 
            : req.body.caracteristicas
    };

    await handleControladores<PlanSaasInputs, PlanSaasConId >(
        res, data, servicioPlanesSass.modPlanesSaas, MAPA_MOD_PLANES_SAAS
    );
};



const deletPlanesSaas = async (req: Request, res: Response) =>{
    
    const data: PlanDeletSaasInputs = {
        id_plan : Number(req.params.id) ,
    };

    await handleControladores<PlanDeletSaasInputs, PlanDelet >(
        res, data, servicioPlanesSass.deletPlanesSaas, MAPA_DELETE_PLANES_SAAS
    );

};


const bajaPlanesSass = async (req: Request, res: Response) =>{
    const data:  PlanEstadoSaasInputs = {
        id_plan : Number(req.params.id) ,
        estado : req.params.estado as 'activo' | 'inactivo'
    };

    await handleControladores<PlanDeletSaasInputs, { id_plan : number}>(
        res, data, servicioPlanesSass.bajaPlanesSaas , MAPA_BAJAS_PLANES_SAAS
    );

};

const listaPlanesSaas = async (req: Request, res: Response) => {
    

    const data : FiltroPlanesInputs = {
        estado: (req.params.estado as "activo" | "inactivo") || "activo"
    }

    await handleControladores<FiltroPlanesInputs, PlanSaasRow[]>(
        res,data, servicioPlanesSass.listaPlanesSaas, MAPA_LISTA_PLANES_SAAS
    );

};

export const method = {
    postPlanesSaas : tryCatch( postPlanesSaas),
    modPlanesSass  : tryCatch( modPlanesSass ),
    deletPlanesSaas : tryCatch( deletPlanesSaas ),
    bajaPlanesSass : tryCatch( bajaPlanesSass),
    listaPlanesSaas : tryCatch( listaPlanesSaas )
}