import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import { method as horarioGymServicio} from "../Servicio/horarios_gym.servicio"
import { fechaHoy } from "../hooks/fecha";

import { MAPA_LISTADO_HORARIO_GYM,
         MAPA_ALTA_HORARIO_GYM, MAPA_ELIMINAR_HORARIO_GYM , MAPA_MOD_HORARIO_GYM,
} from "../respuestas/horarios_gym";

import { HorarioGymCalendarioInput, HorarioGymInput, ModHorarioGymInput, EliminarHorarioGymInput } from "../squemas/horarios_gym";
import { ResultCalendarioHorarioGym, ResultadoAltaHorarioGym, ResultModHorarioGym, ResultEliminarHorarioGym } from "../tipados/horarios_gym";

const altaHorarioGymCtrl = async( req : Request , res : Response) =>{

    const dataRecivida : HorarioGymInput  = {
        id_escuela: Number(req.usuario?.id_escuela),
        dni_profesor: req.body.dni_profesor || null,
        id_sala: Number(req.body.id_sala),
        id_tipo_clase: req.body.id_tipo_clase ? Number(req.body.id_tipo_clase) : null,
        hora_inicio: req.body.hora_inicio,
        hora_fin: req.body.hora_fin,
        dia_semana: req.body.dia_semana,
        fecha_creacion: req.body.fecha_creacion || fechaHoy(),
        estado: req.body.estado || "activos",
        id_usuario : Number(req.usuario?.id)
     };

     await handleControladores<HorarioGymInput, ResultadoAltaHorarioGym>(
        res, dataRecivida, horarioGymServicio.altaGym, MAPA_ALTA_HORARIO_GYM
     );

}; 

const listadoHorarioGym = async( req : Request , res : Response ) =>{
   
    const data : HorarioGymCalendarioInput = {
        id_escuela: Number(req.usuario?.id_escuela),
        estado: req.query.estado as "activos" | "inactivos" | "suspendido" || "activos",
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<HorarioGymCalendarioInput, ResultCalendarioHorarioGym[]>(
        res, data, horarioGymServicio.calendarioGym, MAPA_LISTADO_HORARIO_GYM
    );
};

const modHorarioGymCtrl = async( req : Request, res : Response) => {
  
    const data : ModHorarioGymInput = {
        id : Number(req.body.id),
        id_escuela: Number(req.usuario?.id_escuela),
        dni_profesor: req.body.dni_profesor || null,
        id_sala: Number(req.body.id_sala),
        id_tipo_clase: req.body.id_tipo_clase ? Number(req.body.id_tipo_clase) : null,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<ModHorarioGymInput, ResultModHorarioGym >(
        res, data, horarioGymServicio.modGym, MAPA_MOD_HORARIO_GYM
    );
    
};

const eliminarHorarioGymCtrl = async ( req : Request , res: Response) => {
    
    const  data : EliminarHorarioGymInput  = {
        id_escuela : Number(req.usuario?.id_escuela),
        id         : Number(req.body.id),
        estado     : req.body.estado as "activos" | "inactivos" | "suspendido" || "inactivos",
        vigente    : req.body.vigente as boolean,
        id_usuario : Number(req.usuario?.id)
    };

    await handleControladores<EliminarHorarioGymInput, ResultEliminarHorarioGym>(
        res, data, horarioGymServicio.eliminarGym, MAPA_ELIMINAR_HORARIO_GYM
    );
};

export const method = {
    alta  : tryCatch( altaHorarioGymCtrl),
    mod   : tryCatch(modHorarioGymCtrl),
    eliminar : tryCatch(eliminarHorarioGymCtrl),
    listadoHorarioGym : tryCatch(listadoHorarioGym )
};
