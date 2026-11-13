import { Request, Response } from "express";
import { method as servicioPlantillas } from "../Servicio/plantillas.servicios";
import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import { MAPA_PLANTILLAS } from "../respuestas/plantillas";
import {
    PlantillaAltaInputs,
    PlantillaBajaInputs,
    PlantillaListadoInputs,
    PlantillaAlumnosAgregarInputs,
    PlantillaAlumnoQuitarInputs,
} from "../squemas/plantillas";
import { PlantillaResumen } from "../tipados/plantillas.tipado";

/**
 * Crea una plantilla de asistencia con su lista de alumnos.
 *
 * @async
 * @function alta
 * @param {Request} req - Petición de Express. `req.usuario.id_escuela` viene del
 *   token; el body trae `nombre` y `alumnos` (array de DNIs).
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Responde mediante `handleControladores`.
 */
const alta = async (req: Request, res: Response) => {
    const data: PlantillaAltaInputs = {
        id_escuela: Number(req.usuario?.id_escuela),
        nombre: req.body.nombre,
        alumnos: req.body.alumnos,
    };
    await handleControladores<PlantillaAltaInputs, { id_plantilla: number }>(
        res,
        data,
        servicioPlantillas.altaPlantilla,
        MAPA_PLANTILLAS
    );
};

/**
 * Elimina una plantilla y sus alumnos.
 *
 * @async
 * @function baja
 * @param {Request} req - Petición de Express. `req.params.id` es la plantilla.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Responde mediante `handleControladores`.
 */
const baja = async (req: Request, res: Response) => {
    const data: PlantillaBajaInputs = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
    };
    await handleControladores<PlantillaBajaInputs, Record<string, never>>(
        res,
        data,
        servicioPlantillas.bajaPlantilla,
        MAPA_PLANTILLAS
    );
};

/**
 * Lista las plantillas de la escuela con sus alumnos.
 *
 * @async
 * @function listar
 * @param {Request} req - Petición de Express.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Responde mediante `handleControladores`.
 */
const listar = async (req: Request, res: Response) => {
    const data: PlantillaListadoInputs = {
        id_escuela: Number(req.usuario?.id_escuela),
    };
    await handleControladores<PlantillaListadoInputs, PlantillaResumen[]>(
        res,
        data,
        servicioPlantillas.listarPlantillas,
        MAPA_PLANTILLAS
    );
};

/**
 * Agrega uno o varios alumnos a una plantilla existente.
 *
 * @async
 * @function agregarAlumnos
 * @param {Request} req - Petición de Express. `req.params.id` es la plantilla y
 *   el body trae `alumnos` (array de DNIs).
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Responde mediante `handleControladores`.
 */
const agregarAlumnos = async (req: Request, res: Response) => {
    const data: PlantillaAlumnosAgregarInputs = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
        alumnos: req.body.alumnos,
    };
    await handleControladores<PlantillaAlumnosAgregarInputs, { agregados: number }>(
        res,
        data,
        servicioPlantillas.agregarAlumnosPlantilla,
        MAPA_PLANTILLAS
    );
};

/**
 * Quita un alumno de una plantilla.
 *
 * @async
 * @function quitarAlumno
 * @param {Request} req - Petición de Express. `req.params.id` es la plantilla y
 *   `req.params.dni` el alumno.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<void>} Responde mediante `handleControladores`.
 */
const quitarAlumno = async (req: Request, res: Response) => {
    const data: PlantillaAlumnoQuitarInputs = {
        id_escuela: Number(req.usuario?.id_escuela),
        id_plantilla: Number(req.params.id),
        dni_alumno: Number(req.params.dni),
    };
    await handleControladores<PlantillaAlumnoQuitarInputs, Record<string, never>>(
        res,
        data,
        servicioPlantillas.quitarAlumnoPlantilla,
        MAPA_PLANTILLAS
    );
};

export const method = {
    alta: tryCatch(alta),
    baja: tryCatch(baja),
    listar: tryCatch(listar),
    agregarAlumnos: tryCatch(agregarAlumnos),
    quitarAlumno: tryCatch(quitarAlumno),
};
