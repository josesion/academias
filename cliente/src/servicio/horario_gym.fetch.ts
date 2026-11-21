import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

import type * as TipadoHorarioGym from "../tipadosTs/horario_gym";

export const calendarioGym = async( dataQuery : TipadoHorarioGym.CalendarioGym, signal?: AbortSignal )
: Promise<ApiResponse<TipadoHorarioGym.ClaseHorarioGymData[]>> => {
    const rutaCompleta = `${PAGINA}api/lista_horario_gym?estado=${dataQuery.estado || "activos"}`;
    return await apiFetch( rutaCompleta, {
        method: "GET",
        signal: signal
    });
};

export const altaHorarioGym = async( data : TipadoHorarioGym.DataHorarioGym)
: Promise<ApiResponse<TipadoHorarioGym.DataHorarioGym>> =>{
    const ruta = `${PAGINA}api/alta_horario_gym`;
    return await apiFetch( ruta, {
        method: "POST",
        body: {
            dni_profesor: data.dni_profesor,
            id_sala: data.id_sala,
            id_tipo_clase: data.id_tipo_clase,
            hora_inicio: data.hora_inicio,
            hora_fin: data.hora_fin,
            dia_semana: data.dia_semana,
            fecha_creacion: data.fecha_creacion,
            estado: data.estado,
            modulo: data.modulo
        }
    });
};

export const modHorarioGym = async( data : TipadoHorarioGym.ModHorarioGym, signal?: AbortSignal)
: Promise<ApiResponse<TipadoHorarioGym.ModHorarioGym>> =>{
    const ruta = `${PAGINA}api/mod_horario_gym`;
    return await apiFetch( ruta, {
        method: "PUT",
        body: {
            dni_profesor: data.dni_profesor,
            id_sala: data.id_sala,
            id_tipo_clase: data.id_tipo_clase,
            id: data.id
        },
        signal: signal
    });
};

export const eliminarHorarioGym = async( data : TipadoHorarioGym.EliminarHorarioGym)
: Promise<ApiResponse<TipadoHorarioGym.EliminarHorarioGym>> =>{
    const ruta = `${PAGINA}api/eliminar_horario_gym`;
    return await apiFetch( ruta, {
        method: "DELETE",
        body: {
            id: data.id,
            estado: data.estado,
            vigente: data.vigente
        }
    });
};
