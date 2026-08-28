import { Response, Request} from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";


import { method as servicioFlayer } from '../Servicio/flayer.servicio';
import  type { DataPost, FlayerData } from "../Servicio/flayer.servicio";
import { MAPA_POST_IMAGEN, MAPA_GET_FLAYERS } from "../respuestas/flayer";


const postFlayer = async( req : Request, res: Response) =>{


    if (!req.file) {
        return 
    };  

  const dataBody = {
       id_escuela :Number( req.usuario?.id_escuela),
       titulo : req.body.titulo,
       descripcion  : req.body.descripcion,
       imagen_url : "Url sin cargar",
       public_id  : "Public id sin cargar",
       fecha_actualizacion : null,
       plan : Number(req.body.plan)
  };

    const dataImagen = {
        buffer: req.file.buffer,
        tipo: req.file.mimetype,
        size: req.file.size,
        nombre: req.file.originalname,
    };

    await handleControladores<DataPost, FlayerData>( 
        res, { dataTabla: dataBody, imagen: dataImagen }, servicioFlayer.postFlayer, MAPA_POST_IMAGEN
    );
  

};

const getFlayers = async (__req : Request,  res: Response ) =>{

    await handleControladores(
        res , {} , servicioFlayer.getFlayers , MAPA_GET_FLAYERS
    );
    
};


export const method = {
    postFlayer : tryCatch( postFlayer ),
    getFlayers : tryCatch( getFlayers),
};  


/**
 FILE: {
  fieldname: 'imagen',
  originalname: 'ChatGPT Image 20 may 2026, 21_29_59.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 04 00 00 00 04 00 08 06 00 00 00 7f 1d 2b 83 00 00 71 62 63 61 42 58 00 00 71 62 6a 75 6d 62 00 ... 1640393 more bytes>,
  size: 1640443
}
 */