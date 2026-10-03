import { Request, Response } from "express";
import { method as serviciosEscuelas } from "../Servicio/escuela.servicios";

import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";

import { MAPA_POST_ESCUELA, MAPA_MODIFICAR_ESCUELA, MAPA_ESTADO_ESCUELA, MAPA_LISTADO_ESCUELA } from "../respuestas/escuelas";
import { EscuelaPost ,  EscuelaModificarPost } from "../Servicio/escuela.servicios";
import { EscuelaResumen, RetornoEstado } from "../data/escuela.data";

import { ModEscuelasInputs, EstadoEscuelasInputs, ListadoEscuelasInputs } from "../squemas/escuelas";

const ping = async(__req: Request, __res: Response) => {


};

const crearEscuela = async (req: Request, res: Response) =>{

    if (!req.file) {
        return 
    };  

    const dataImagen = {
        buffer: req.file.buffer,
        tipo: req.file.mimetype,
        size: req.file.size,
        nombre: req.file.originalname,
    };

    const dataEscuela = {
        dni_propietario: req.body.dni_propietario,
        nombre_propietario: req.body.nombre_propietario,
        apellido_propietario: req.body.apellido_propietario,
        razon_social: req.body.razon_social,
        direccion: req.body.direccion,
        celular: req.body.celular,
        urlImagen: req.body.urlImagen || "", // O si la subes a un bucket/servidor antes, aquí iría la URL resultante
        fecha_registro: req.body.fecha_registro || new Date().toISOString().split('T')[0],
        baja: req.body.baja || "activos",
    };

    const data : EscuelaPost = {
        imagen : dataImagen,
        escuela : dataEscuela,
    }

    await handleControladores<EscuelaPost, EscuelaResumen>(
        res, data, serviciosEscuelas.crearEscuela, MAPA_POST_ESCUELA
    );

};

const modEscuelas = async ( req: Request, res: Response ) => {
    let dataEscuela: ModEscuelasInputs;

    const imagenModificada = req.body.imagenMod === "true" || req.body.imagenMod === true;
  
    // Se asigna directamente a la constante, chau warning de variable no leída
    const imagenValida = imagenModificada && req.file ? {
        buffer: req.file.buffer,
        tipo: req.file.mimetype,
        size: req.file.size,
        nombre: req.file.originalname,
    } : null;

    dataEscuela = {
        dni_propietario: req.body.dni_propietario,
        nombre_propietario: req.body.nombre_propietario,
        apellido_propietario: req.body.apellido_propietario,
        razon_social: req.body.razon_social,
        direccion: req.body.direccion,
        celular: req.body.celular,
        urlImagen: req.body.urlImagen || "",
        baja: req.body.baja || "activos",
        id_escuela: Number(req.body.id_escuela)
    };

    const data: EscuelaModificarPost = {
        imagen: imagenValida,
        escuela: dataEscuela,
        imagenMod: imagenModificada,
    };
    // Retorna directo la info lista para que la consuma tu servicio/capa de datos
   
    await handleControladores<EscuelaModificarPost,EscuelaResumen >(
        res, data, serviciosEscuelas.modificarEscuelaServicio , MAPA_MODIFICAR_ESCUELA
    ); 
};

const estadoEscuela = async ( req: Request, res: Response ) =>{

    const data = {
        estado : req.params.estado,
        id_escuela : Number(req.params.id_escuela)
    }    

    console.log(data)

    await handleControladores<EstadoEscuelasInputs , RetornoEstado>(
        res, data, serviciosEscuelas.estadoEscuela, MAPA_ESTADO_ESCUELA
    );

};


const listadoEscuela = async ( req: Request, res: Response ) =>{

    const data: ListadoEscuelasInputs = {
        apellido: (req.query.apellido as string) || "",
        dni: (req.query.dni as string) || "",
        razon_social: (req.query.razon_social as string) || "",
        estado: (req.query.estado as any) || "activos",
        pagina: req.query.pagina ? Number(req.query.pagina) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: 0
    };

    await handleControladores<any, any>(
        res,
        data,
        serviciosEscuelas.listaEscuela,
        MAPA_LISTADO_ESCUELA
    );

};

export const method = {
    ping: tryCatch(ping),
    crearEscuela : tryCatch(crearEscuela),
    modEscuelas : tryCatch(modEscuelas),
    estadoEscuela : tryCatch( estadoEscuela ),
    listadoEscuela : tryCatch( listadoEscuela ),
}; 