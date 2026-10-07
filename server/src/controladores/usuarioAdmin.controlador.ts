import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioUsuarioAdmin } from "../Servicio/usuarioAdmin.servicio";

import { MAPA_LISTAR_USUARIO_ADMIN, MAPA_CREAR_USUARIO_ADMIN,
         MAPA_ACTUALIZAR_USUARIO_ADMIN, MAPA_ELIMINAR_USUARIO_ADMIN
       } from "../respuestas/usuarioAdmin";

/**
 * Controlador del listado de usuarios administradores.
 *
 * @param req - Petición de Express: lee filtros y paginación desde `req.query`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listar = async ( req : Request , res : Response ) => {

    // TODO: armar los parámetros de listado desde req.query (filtros + paginación)
    const parametros = { ...req.query };

    await handleControladores<{}, unknown>(
        res, parametros, servicioUsuarioAdmin.listar, MAPA_LISTAR_USUARIO_ADMIN
    );
};

/**
 * Controlador del alta de un usuario administrador.
 *
 * @param req - Petición de Express: lee el cuerpo desde `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const crear = async ( req : Request , res : Response ) => {

    // TODO: armar el objeto de alta desde req.body (id_escuela/id_usuario salen del token)
    const parametros = { ...req.body };

    await handleControladores<{}, unknown>(
        res, parametros, servicioUsuarioAdmin.crear, MAPA_CREAR_USUARIO_ADMIN
    );
};

/**
 * Controlador de la modificación de un usuario administrador.
 *
 * @param req - Petición de Express: lee el id desde `req.params` y el cuerpo desde `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const actualizar = async ( req : Request , res : Response ) => {

    // TODO: armar el objeto de modificación desde req.params + req.body
    const parametros = { ...req.body };

    await handleControladores<{}, unknown>(
        res, parametros, servicioUsuarioAdmin.actualizar, MAPA_ACTUALIZAR_USUARIO_ADMIN
    );
};

/**
 * Controlador de la baja de un usuario administrador.
 *
 * @param req - Petición de Express: lee el id desde `req.params`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const eliminar = async ( req : Request , res : Response ) => {

    // TODO: armar la identificación del usuario desde req.params
    const parametros = { ...req.params };

    await handleControladores<{}, unknown>(
        res, parametros, servicioUsuarioAdmin.eliminar, MAPA_ELIMINAR_USUARIO_ADMIN
    );
};

export const method = {
    listar : tryCatch( listar ),
    crear : tryCatch( crear ),
    actualizar : tryCatch( actualizar ),
    eliminar : tryCatch( eliminar )
};
