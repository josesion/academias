import { Response , Request } from "express";
// hooks
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
//Servicios Data
import { method as horarioServicio} from "../Servicio/horarios.servicios"

// Typados

import { MAPA_LISTADO_HORARIO,
         MAPA_ALTA_HORARIO, MAPA_ELIMINAR_HORARIO , MAPA_MOD_HORARIO,
 } from "../respuestas/horarios";

import  { HorarioCalendarioInput, HorarioClaseInput, ModHorarioInput, EliminarHorarioInput  } from "../squemas/horarios_clases";
import { ResultCalendarioHorario, ResultadoAltaHorario ,ResultModHorario, ResultEliminarHorario} from "../tipados/horarios";



/**
 * Controlador HTTP encargado de procesar la creación o alta de un nuevo horario de clase,
 * estructurando los datos enviados en el cuerpo de la petición junto con la información 
 * de la escuela y el usuario autenticados.
 * 
 * @async
 * @function altaHorario
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el body con los datos del horario (dni_profesor, id_nivel, id_tipo_clase, horas, día, etc.) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const altaHorario = async( req : Request , res : Response) =>{

    const dataRecivida : HorarioClaseInput  = {
        id_escuela: Number(req.usuario?.id_escuela),
        dni_profesor:  req.body.dni_profesor,
        id_nivel: Number(req.body.id_nivel),
        id_tipo_clase: Number(req.body.id_tipo_clase),
        hora_inicio: req.body.hora_inicio,
        hora_fin: req.body.hora_fin,
        dia_semana: req.body.dia_semana,
        fecha_creacion:  req.body.fecha_creacion,
        estado: req.body.estado,
        id_usuario : Number(req.usuario?.id)
     };

     await handleControladores<HorarioClaseInput, ResultadoAltaHorario>(
        res, dataRecivida, horarioServicio.alta, MAPA_ALTA_HORARIO
     );

}; 



/**
 * Controlador HTTP encargado de obtener el listado de horarios de clase de la escuela,
 * filtrando por estado mediante los parámetros de consulta (query params) y utilizando 
 * la información del usuario y la escuela autenticados.
 * 
 * @async
 * @function listadoHorarioEscuela
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el query con el filtro de estado y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const listadoHorarioEscuela = async( req : Request , res : Response ) =>{
   
    const data : HorarioCalendarioInput = {
        id_escuela: Number(req.usuario?.id_escuela),
        estado: req.query.estado as "activos" | "inactivos" | "suspendido",
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<HorarioCalendarioInput,ResultCalendarioHorario[] >(
        res, data, horarioServicio.calendario, MAPA_LISTADO_HORARIO
    );
};



/**
 * Controlador HTTP encargado de procesar la modificación de un horario de clase existente,
 * extrayendo los datos del cuerpo de la petición y la información de la escuela y usuario autenticados.
 * 
 * @async
 * @function modHorario
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el body con los datos a modificar (id, id_nivel, id_tipo_clase, dni_profesor) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const modHorario = async( req : Request, res : Response) => {
  
    const data : ModHorarioInput = {
        id : Number(req.body.id),
        id_escuela: Number(req.usuario?.id_escuela),
        id_nivel : Number(req.body.id_nivel),
        id_tipo_clase :  Number(req.body.id_tipo_clase),
        dni_profesor  : req.body.dni_profesor as string,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<ModHorarioInput, ResultModHorario >(
        res, data, horarioServicio.mod, MAPA_MOD_HORARIO
    );
    
};


/**
 * Controlador HTTP encargado de gestionar la eliminación o cambio de estado de un horario de clase,
 * extrayendo los datos del cuerpo de la petición y la información de la escuela y usuario autenticados.
 * 
 * @async
 * @function elimnarHorario
 * @param {Request} req - Objeto de solicitud HTTP de Express, contiene el body con los datos (id, estado, vigente) y los datos del usuario.
 * @param {Response} res - Objeto de respuesta HTTP de Express.
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente mediante el manejador.
 */
const elimnarHorario = async ( req : Request , res: Response) => {
    
    const  data : EliminarHorarioInput  = {
        id_escuela : Number(req.usuario?.id_escuela),
        id         : Number(req.body.id),
        estado     : req.body.estado as "activos" | "inactivos" | "suspendido",
        vigente    : req.body.vigente as boolean,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<EliminarHorarioInput, ResultEliminarHorario>(
        res, data, horarioServicio.eliminar, MAPA_ELIMINAR_HORARIO
    );
};


export const method = {
    alta  : tryCatch( altaHorario),
    mod   : tryCatch(modHorario),
    eliminar : tryCatch(elimnarHorario),
    listadoHorarioEscuela : tryCatch(listadoHorarioEscuela )
};