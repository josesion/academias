import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";

import { method as servicioSalas } from "../Servicio/salas.servicio";

import { tryCatch } from "../utils/tryCatch"; 
import { fechaHoy } from "../hooks/fecha"; 

import { MAPA_ALTA_SALA, MAPA_MOD_SALA,
         MAPA_ESTADO_SALA, MAPA_LISTADO_SALA
} from "../respuestas/salas";

import { ResulListSinPagSalaUsuarios } from "../tipados/sala.data";

import { CrearSalaInput , ModificarSalaInput, 
         EstadoSalaInput, ListadoSalaInput, ListadoSalaSinPagInput
} from "../squemas/salas";

const altaSala = async ( req : Request , res : Response ) => {

    const { nombre, capacidad } = req.body;

    const dataSala : CrearSalaInput = {
        nombre,
        capacidad: capacidad ? Number(capacidad) : null,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores< CrearSalaInput, { nombre : string }>(
        res, dataSala, servicioSalas.altaSala, MAPA_ALTA_SALA
    );
};

const modSala = async ( req : Request , res : Response ) => {
   
    const { id } = req.params;
    const { nombre, capacidad } = req.body;

    const modData : ModificarSalaInput = {
        id : Number(id),
        nombre,
        capacidad: capacidad ? Number(capacidad) : null,
        id_escuela : Number(req.usuario?.id_escuela),
        id_usuario : Number(req.usuario?.id)   
    };

    await handleControladores<ModificarSalaInput, { nombre : string}>(
        res, modData, servicioSalas.modSala, MAPA_MOD_SALA
    );
};

const estadoSalaCtrl = async(req : Request , res : Response )=> {

    const { id , estado } = req.params;

    const estadoData : EstadoSalaInput = {
        id : Number(id),
        id_escuela : Number(req.usuario?.id_escuela),
        estado : estado as "activos" | "inactivos",
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores< EstadoSalaInput ,{ id : number }>(
        res, estadoData, servicioSalas.estadoSala, MAPA_ESTADO_SALA
    );
};

const listadoSalas = async( req : Request , res : Response ) =>{
   
    const { nombre , estado, limite, pagina} = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limite) ;

   const dataListado : ListadoSalaInput  = {
        nombre : nombre as string,
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number( req.usuario?.id_escuela ),
        limite : Number( limite ),
        offset  : Number( offset ),
        pagina : Number( pagina )    
   };

   await handleControladores< ListadoSalaInput , ResulListSinPagSalaUsuarios[]>(
        res, dataListado, servicioSalas.listadoSalas, MAPA_LISTADO_SALA
   );

};

const listadoSalasSinPag = async( req : Request , res : Response ) =>{
    const { nombre , estado } = req.query;

    const dataListado : ListadoSalaSinPagInput = {
        nombre : nombre as string,
        estado : estado as "activos" | "inactivos" | "todos",
        id_escuela : Number( req.usuario?.id_escuela )          
    };

    await handleControladores<ListadoSalaSinPagInput,{}>(
        res, dataListado, servicioSalas.listadoSalasSinPag, MAPA_LISTADO_SALA
    );
     
};

export const method = {
    altaSala : tryCatch( altaSala ),
    modSala  : tryCatch( modSala ),
    estadoSalaCtrl : tryCatch( estadoSalaCtrl),
    listadoSalas : tryCatch( listadoSalas),
    listadoSalasSinPag : tryCatch( listadoSalasSinPag )
};
