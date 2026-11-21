import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

import type * as TipadoSala from "../tipadosTs/sala";

export const crearSala = async( data : TipadoSala.CrearSala)
: Promise<ApiResponse<{nombre: string}>> =>{
    const ruta = `${PAGINA}api/sala_usu_alta`;
    return await apiFetch( ruta, {
        method: "POST",
        body: {
            nombre: data.nombre,
            capacidad: data.capacidad
        }
    });
};

export const modificarSala = async( data : TipadoSala.ModificarSala )
: Promise<ApiResponse<{nombre: string}>> =>{
    const ruta = `${PAGINA}api/sala_usu_modificar/${data.id}`;
    return await apiFetch( ruta, {
        method: "PUT",
        body: {
            nombre: data.nombre,
            capacidad: data.capacidad
        }
    });
};

export const estadoSala = async( data : TipadoSala.EstadoSala )
: Promise<ApiResponse<{id: number}>> =>{
    const ruta = `${PAGINA}api/sala_usu_estado/${data.id}/${data.estado}`;
    return await apiFetch( ruta, {
        method: "PUT",
        body: {}
    });
};

export const listarSalasSinPag = async( dataQuery : TipadoSala.FiltroSala, signal?: AbortSignal )
: Promise<ApiResponse<TipadoSala.DataSala[]>> => {
    const parametrosConvertidos = {
        nombre: dataQuery.nombre || "",
        estado: dataQuery.estado || "activos"
    };

    const rutaCompleta = `${PAGINA}api/listaSala_usu_sin_pag?${new URLSearchParams(parametrosConvertidos).toString()}`;
    return await apiFetch( rutaCompleta, {
        method: "GET",
        signal: signal
    });
};

export const listadoSala = async( dataQuery : TipadoSala.ListadoSala, signal?: AbortSignal )
: Promise<ApiResponse<TipadoSala.ResultRegistroSala>> => {
    const parametrosConvertidos = {
        nombre: dataQuery.nombre || "",
        estado: dataQuery.estado || "activos",
        limite: dataQuery.limite.toString(),
        pagina: dataQuery.pagina.toString()
    };

    const rutaCompleta = `${PAGINA}api/listaSala_usu?${new URLSearchParams(parametrosConvertidos).toString()}`;
    return await apiFetch( rutaCompleta, {
        method: "GET",
        signal: signal
    });
};
