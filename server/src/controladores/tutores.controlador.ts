/**
 * @fileoverview Controlador Express para la Gestión CRUD (ABML) de la entidad Tutor.
 * @module controllers/tutores.controller
 * @description Contiene los manejadores de rutas para Alta, Baja, Modificación y Listado de tutores.
 */
import { Response, Request } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";
import { method as servicioTutor } from "../Servicio/tutores.servicio";

import { TutorInputs, EliminarTutorInputs, ListaTutorInputs, ListaTutorSinPaginacionInputs } from "../squemas/tutores";
import type { RetornoRegistroTutor, RetornoModTutor, DataTutoresListado, DataTutoresListadoSinPag, DataTutoresPorAlumno }
         from "../tipados/tutores.data";

import { MAPA_ALTA_TUTOR, MAPA_MOD_TUTOR, MAPA_LISTAR_SIN_PAGINACION_TUTORES,
         MAPA_ESTADO_TUTOR, MAPA_LISTAR_TUTORES, MAPA_TUTORES_POR_ALUMNO }
         from "../respuestas/tutores";

/**
 * Controlador para registrar un nuevo tutor.
 */
const altaTutor = async (req: Request, res: Response) => {
    const dataTutor = {
        dni_tutor: req.body.dni_tutor,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        celular: req.body.celular,
        email: req.body.email || undefined,
        relacion_con_alumno: req.body.relacion_con_alumno,
        dni_alumno: req.body.dni_alumno,
        id_escuela: Number(req.usuario?.id_escuela),
        id_usuario: Number(req.usuario?.id),
    };

    await handleControladores<TutorInputs, RetornoRegistroTutor>(
        res, dataTutor, servicioTutor.altaTutor, MAPA_ALTA_TUTOR
    );
};

/**
 * Controlador para modificar los datos de un tutor.
 */
const modTutor = async (req: Request, res: Response) => {
    const { dni_tutor } = req.params;
    const { nombre, apellido, celular, email, relacion_con_alumno } = req.body;

    const datoTutor = {
        dni_tutor,
        nombre,
        apellido,
        celular: Array.isArray(celular) ? celular.join('') : String(celular),
        email: email || undefined,
        relacion_con_alumno,
        dni_alumno: req.body.dni_alumno || '',
        id_escuela: Number(req.usuario?.id_escuela),
        id_usuario: Number(req.usuario?.id)
    };

    await handleControladores<TutorInputs, RetornoModTutor>(
        res, datoTutor, servicioTutor.modTutor, MAPA_MOD_TUTOR
    );
};

/**
 * Controlador para cambiar el estado de un tutor (activar/inactivar).
 */
const borrarTutor = async (req: Request, res: Response) => {
    const { id_tutor, estado } = req.params;

    const tutorData: EliminarTutorInputs = {
        id_tutor: Number(id_tutor),
        id_escuela: Number(req.usuario?.id_escuela),
        estado: estado as "activos" | "inactivos",
        id_usuario: Number(req.usuario?.id)
    };

    await handleControladores<EliminarTutorInputs, { id_tutor: number }>(
        res, tutorData, servicioTutor.estadoTutor, MAPA_ESTADO_TUTOR
    );
};

/**
 * Controlador para obtener el listado paginado de tutores.
 */
const listarTutores = async (req: Request, res: Response) => {
    const { limit, pagina } = req.query;
    const estado = String(req.query.estado ?? "");
    const dni = String(req.query.dni ?? "");
    const email = String(req.query.email ?? "");
    const apellido = String(req.query.apellido ?? "");
    const offset = (Number(pagina) - 1) * Number(limit);

    const dataListado: ListaTutorInputs = {
        estado,
        dni,
        email,
        apellido,
        escuela: Number(req.usuario?.id_escuela),
        id_usuario: Number(req.usuario?.id),
        limit: Number(limit),
        offset: Number(offset),
        pagina: Number(pagina)
    };

    await handleControladores<ListaTutorInputs, DataTutoresListado[]>(
        res, dataListado, servicioTutor.listaTutores, MAPA_LISTAR_TUTORES
    );
};

/**
 * Controlador para obtener el listado sin paginación de tutores.
 */
const listaTutorSinPag = async (req: Request, res: Response) => {
    const { dni, email, estado } = req.query;

    const data: ListaTutorSinPaginacionInputs = {
        dni: String(dni),
        email: String(email),
        estado: String(estado),
        escuela: Number(req.usuario?.id_escuela),
        id_usuario: Number(req.usuario?.id)
    };

    await handleControladores<ListaTutorSinPaginacionInputs, DataTutoresListadoSinPag[]>(
        res, data, servicioTutor.listadoSinPaginacion, MAPA_LISTAR_SIN_PAGINACION_TUTORES
    );
};

/**
 * Controlador para obtener los tutores de un alumno por su DNI.
 */
const tutoresPorAlumno = async (req: Request, res: Response) => {
    const { dni_alumno } = req.params;

    await handleControladores<any, DataTutoresPorAlumno[]>(
        res,
        { dni_alumno, id_escuela: Number(req.usuario?.id_escuela) },
        () => servicioTutor.tutoresPorAlumno(dni_alumno, Number(req.usuario?.id_escuela)),
        MAPA_TUTORES_POR_ALUMNO
    );
};

export const method = {
    altaTutor: tryCatch(altaTutor),
    modTutor: tryCatch(modTutor),
    borrarTutor: tryCatch(borrarTutor),
    listarTutores: tryCatch(listarTutores),
    listaTutorSinPag: tryCatch(listaTutorSinPag),
    tutoresPorAlumno: tryCatch(tutoresPorAlumno)
};
