import { Response, Request} from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";


import { method as servicioFlayer } from '../Servicio/flayer.servicio';
import  type { DataPost, FlayerData } from "../Servicio/flayer.servicio";
import { MAPA_POST_IMAGEN, MAPA_GET_FLAYERS, MAPA_DELETE_FLAYERS } from "../respuestas/flayer";


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
       plan : Number(req.usuario?.flayer),
       id_usuario : Number( req.usuario?.id)
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


const getFlayerEScuela = async ( req : Request,  res: Response ) =>{

    const data = {
        id_escuela : Number(req.usuario?.id_escuela),
    };
    
    await handleControladores(
        res , data , servicioFlayer.getFlayerEscuela , MAPA_GET_FLAYERS
    );
    

};


const deletFlayerEscuela = async( req : Request,  res: Response) =>{

    const { idflayer  } = req.params;

    const data = {
        id_flayer : Number(idflayer),
        id_usuario : Number(req.usuario?.id) 
    };

    await  handleControladores(
        res, data,  servicioFlayer.eliminarFlayer, MAPA_DELETE_FLAYERS
    );

};


export const method = {
    postFlayer : tryCatch( postFlayer ),
    getFlayers : tryCatch( getFlayers),
    getFlayerEscuela : tryCatch( getFlayerEScuela),
    deleteFlayerEscuela : tryCatch( deletFlayerEscuela),
};  


