import { Response, Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";
import { method as plantillasServicio } from "../Servicio/plantillas.servicio";
import { CodigoEstadoHTTP } from "../tipados/generico";
import { MAPA_PLANTILLAS, ERROR_INTERNO_SERVIDOR } from "../respuestas/plantillas";

const alta = async (req: Request, res: Response) => {
    const data = {
        id_escuela: Number(req.usuario?.id_escuela),
        nombre: req.body.nombre,
        alumnos: req.body.alumnos,
    };
    const result = await plantillasServicio.altaPlantilla(data);
    const config = MAPA_PLANTILLAS[result.code] || ERROR_INTERNO_SERVIDOR;
    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, undefined, result.code);
    }
    return enviarResponseError(res, config.status, result.message || config.msg, result.code);
};

const baja = async (req: Request, res: Response) => {
    const data = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
    };
    const result = await plantillasServicio.bajaPlantilla(data);
    const config = MAPA_PLANTILLAS[result.code] || ERROR_INTERNO_SERVIDOR;
    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, undefined, result.code);
    }
    return enviarResponseError(res, config.status, result.message || config.msg, result.code);
};

const listar = async (req: Request, res: Response) => {
    const data = { id_escuela: Number(req.usuario?.id_escuela) };
    const result = await plantillasServicio.listarPlantillas(data);
    const config = MAPA_PLANTILLAS[result.code] || ERROR_INTERNO_SERVIDOR;
    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, undefined, result.code);
    }
    return enviarResponseError(res, config.status, result.message || config.msg, result.code);
};

/** Agrega alumnos a una plantilla existente. */
const agregarAlumnos = async (req: Request, res: Response) => {
    const data = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
        alumnos: req.body.alumnos,
    };
    const result = await plantillasServicio.agregarAlumnosPlantilla(data);
    const config = MAPA_PLANTILLAS[result.code] || ERROR_INTERNO_SERVIDOR;
    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, undefined, result.code);
    }
    return enviarResponseError(res, config.status, result.message || config.msg, result.code);
};

/** Quita un alumno de una plantilla. */
const quitarAlumno = async (req: Request, res: Response) => {
    const data = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
        dni_alumno: Number(req.params.dni),
    };
    const result = await plantillasServicio.quitarAlumnoPlantilla(data);
    const config = MAPA_PLANTILLAS[result.code] || ERROR_INTERNO_SERVIDOR;
    if (config.status === CodigoEstadoHTTP.OK) {
        return enviarResponse(res, config.status, result.message || config.msg, result.data, undefined, result.code);
    }
    return enviarResponseError(res, config.status, result.message || config.msg, result.code);
};

export const method = {
    alta: tryCatch(alta),
    baja: tryCatch(baja),
    listar: tryCatch(listar),
    agregarAlumnos: tryCatch(agregarAlumnos),
    quitarAlumno: tryCatch(quitarAlumno),
};