import { Request , Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { method as servicioUsuarioAdmin } from "../Servicio/usuarioAdmin.servicio";

import { MAPA_LISTAR_USUARIO_ADMIN, MAPA_CREAR_USUARIO_ADMIN,
         MAPA_ACTUALIZAR_USUARIO_ADMIN, MAPA_ELIMINAR_USUARIO_ADMIN
       } from "../respuestas/usuarioAdmin";

import { ListadoUsuarioAdminQuery, InputCrearUsuarioAdmin, InputActualizarUsuarioAdmin, InputEliminarUsuarioAdmin } from "../squemas/usuarioAdmin";
import { FilaUsuarioAdmin, DataCrearResultUsuarioAdmin, DataActualizarResultUsuarioAdmin, DataEliminarResultUsuarioAdmin } from "../data/usuarioAdmin.data";

/**
 * Controlador del listado de usuarios con rol `alumno`.
 *
 * El rol NO viaja por la query: lo fija el Servicio. Acá solo se arma el objeto
 * tipado (`ListadoUsuarioAdminQuery`) con los valores ya convertidos a número,
 * dejando los defaults que define el schema.
 *
 * @param req - Petición de Express: `pagina`, `limit`, `id_escuela` en `req.query`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listarAlumnos = async ( req : Request , res : Response ) : Promise<void> => {

    const data : ListadoUsuarioAdminQuery = {
        pagina     : req.query.pagina     ? Number(req.query.pagina)     : 1,
        limit      : req.query.limit      ? Number(req.query.limit)      : 10,
        id_escuela : req.query.id_escuela ? Number(req.query.id_escuela) : undefined
    };

    await handleControladores<ListadoUsuarioAdminQuery, FilaUsuarioAdmin[]>(
        res, data, servicioUsuarioAdmin.listarAlumnos, MAPA_LISTAR_USUARIO_ADMIN
    );
};

/**
 * Controlador del listado de usuarios con rol `usuario`.
 *
 * El rol NO viaja por la query: lo fija el Servicio. Acá solo se arma el objeto
 * tipado (`ListadoUsuarioAdminQuery`) con los valores ya convertidos a número,
 * dejando los defaults que define el schema.
 *
 * @param req - Petición de Express: `pagina`, `limit`, `id_escuela` en `req.query`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const listarUsuarios = async ( req : Request , res : Response ) : Promise<void> => {

    const data : ListadoUsuarioAdminQuery = {
        pagina     : req.query.pagina     ? Number(req.query.pagina)     : 1,
        limit      : req.query.limit      ? Number(req.query.limit)      : 10,
        id_escuela : req.query.id_escuela ? Number(req.query.id_escuela) : undefined
    };

    await handleControladores<ListadoUsuarioAdminQuery, FilaUsuarioAdmin[]>(
        res, data, servicioUsuarioAdmin.listarUsuarios, MAPA_LISTAR_USUARIO_ADMIN
    );
};

/**
 * Controlador del alta de un usuario (rol `alumno` o `usuario`).
 *
 * Arma el objeto tipado campo por campo desde `req.body`. `id_escuela` lo manda el
 * frontend en el formulario de alta (no sale del token: el alta no siempre es en la
 * escuela de la sesión). `estado` y `fecha_alta` no viajan: los pone la BD con sus DEFAULT.
 * El control de rol (`solo administrador`) lo hace el middleware de la ruta.
 *
 * @param req - Petición de Express: datos del usuario en `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const crear = async ( req : Request , res : Response ) : Promise<void> => {

    const data : InputCrearUsuarioAdmin = {
        usuario    : req.body.usuario,
        contrasena : req.body.contrasena,
        nombre     : req.body.nombre,
        apellido   : req.body.apellido,
        celular    : typeof req.body.celular === "string" ? req.body.celular : undefined,
        correo     : req.body.correo,
        rol        : req.body.rol,
        id_escuela : Number(req.body.id_escuela)
    };

    await handleControladores<InputCrearUsuarioAdmin, DataCrearResultUsuarioAdmin>(     
        res, data, servicioUsuarioAdmin.crear, MAPA_CREAR_USUARIO_ADMIN
    );
};

/**
 * Controlador de la modificación de un usuario.
 *
 * Arma el objeto tipado campo por campo desde `req.body` (mismo patrón que `crear`).
 * El identificador va en el body: la ruta no tiene `:id`, por lo que `id_usuario` es
 * el único que usa el `WHERE`. `rol`, `estado`, `id_escuela` y `fecha_alta` NO se
 * reciben: no se modifican. Si un campo no llega, queda `undefined` y Zod lo deja
 * fuera del UPDATE.
 *
 * @param req - Petición de Express: `id_usuario` (obligatorio) y los campos a modificar en `req.body`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const actualizar = async ( req : Request , res : Response ) : Promise<void> => {

    const data : InputActualizarUsuarioAdmin = {
        id_usuario : Number(req.body.id_usuario),
        usuario    : req.body.usuario,
        contrasena : req.body.contrasena,
        nombre     : req.body.nombre,
        apellido   : req.body.apellido,
        celular    : typeof req.body.celular === "string" ? req.body.celular : undefined,
        correo     : req.body.correo
    };

    await handleControladores<InputActualizarUsuarioAdmin, DataActualizarResultUsuarioAdmin>(
        res, data, servicioUsuarioAdmin.actualizar, MAPA_ACTUALIZAR_USUARIO_ADMIN
    );
};

/**
 * Controlador de la **baja lógica / reactivación** de una cuenta.
 *
 * Arma el objeto tipado campo por campo (mismo patrón que `crear` y `actualizar`):
 * - `id_usuario` y `estado` salen del **body** (`{ id_usuario, estado }`).
 * - `id_propio` sale del **token** (`req.usuario.id`, ya validado por
 *   `permisos.validarPermiso`): es el que permite detectar un intento de
 *   darse de baja a uno mismo. **Nunca** se lee de `req.params`: la ruta no
 *   tiene `:id`.
 *
 * @param req - Petición de Express: `req.body` con `id_usuario` y `estado`.
 * @param res - Respuesta de Express.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const eliminar = async ( req : Request , res : Response ) : Promise<void> => {

    const data : InputEliminarUsuarioAdmin = {
        id_usuario : Number(req.body.id_usuario),
        estado     : req.body.estado,
        id_propio  : req.usuario ? req.usuario.id : 0
    };

    await handleControladores<InputEliminarUsuarioAdmin, DataEliminarResultUsuarioAdmin>(
        res, data, servicioUsuarioAdmin.eliminar, MAPA_ELIMINAR_USUARIO_ADMIN
    );
};

export const method = {
    listarAlumnos : tryCatch( listarAlumnos ),
    listarUsuarios : tryCatch( listarUsuarios ),
    crear : tryCatch( crear ),
    actualizar : tryCatch( actualizar ),
    eliminar : tryCatch( eliminar )
};
