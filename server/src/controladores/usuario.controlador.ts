import { Request, Response } from "express";


import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import { method as servicioUsuario } from "../Servicio/usuario.servicio";


import { MAPA_OBTENER_PERFIL, MAPA_MODIFICAR_PERFIL,
         MAPA_ESCUELA_PERFIL, MAPA_ESCUELA_LOGO_ACTUALIZADO, MAPA_ESCUELA_LOGO_QUITADO
} from "../respuestas/usuario";


/**
 * Controlador para que el usuario autenticado modifique su propio usuario, contraseña, correo y/o celular.
 * 
 * @param req - Objeto de solicitud HTTP que contiene en `body`:
 *   - `nuevo_usuario` (opcional): nuevo nombre de usuario
 *   - `nueva_contrasena` (opcional): nueva contraseña
 *   - `correo` (opcional): nuevo correo electrónico
 *   - `celular` (opcional): nuevo número de celular
 *   - `contrasena_actual` (requerido): contraseña actual para verificación
 * @param res - Objeto de respuesta HTTP.
 * 
 * Flujo:
 * 1. Obtiene `id_usuario` del token (req.usuario.id).
 * 2. Arma el objeto con datos del body + usuario_id.
 * 3. Ejecuta `handleControladores` con el servicio y MAPA_MODIFICAR_PERFIL.
 * 
 * @returns Respuesta HTTP con perfil actualizado o error.
 */
const modMiPerfil = async (req: Request, res: Response) => {
    const data = {
        usuario_id: req.usuario!.id,
        nuevo_usuario: req.body.nuevo_usuario,
        nueva_contrasena: req.body.nueva_contrasena,
        correo: req.body.correo,
        celular: req.body.celular,
        contrasena_actual: req.body.contrasena_actual,
        rol : req.usuario?.rol
    };
  
    await handleControladores(res, data, servicioUsuario.modMiPerfil, MAPA_MODIFICAR_PERFIL);
};

/**
 * Controlador para obtener el perfil del usuario autenticado.
 * 
 * @param req - Objeto de solicitud HTTP (usa req.usuario.id del token).
 * @param res - Objeto de respuesta HTTP.
 * 
 * Flujo:
 * 1. Obtiene `id_usuario` del token (req.usuario.id).
 * 2. Ejecuta `handleControladores` con el servicio y MAPA_OBTENER_PERFIL.
 * 3. Devuelve 200 con datos del perfil (usuario, nombre, apellido, correo, celular, rol, id_escuela).
 * 
 * @returns Respuesta HTTP con perfil del usuario o error.
 */
const obtenerMiPerfil = async (req: Request, res: Response) => {
    const data = {
        usuario_id: req.usuario!.id,
    };

    await handleControladores(res, data, servicioUsuario.obtenerMiPerfil, MAPA_OBTENER_PERFIL);
};




/**
 * Controlador para obtener los datos de la escuela del usuario autenticado
 * (`GET /api/usuario_perfil/escuela`, spec 051).
 *
 * El `id_escuela` sale SIEMPRE del token: la ruta no acepta id por body, query
 * ni params. Lo puede llamar cualquier rol autenticado (el `alumno` necesita
 * ver el logo de su escuela).
 *
 * @param req - Objeto de solicitud HTTP (usa `req.usuario.id_escuela` del token).
 * @param res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const obtenerEscuelaPerfil = async (req: Request, res: Response) => {
    const data = {
        id_escuela: req.usuario!.id_escuela,
    };

    await handleControladores(res, data, servicioUsuario.obtenerEscuelaPerfil, MAPA_ESCUELA_PERFIL);
};

/**
 * Controlador para subir o reemplazar el logo de la escuela
 * (`PUT /api/usuario_perfil/escuela/logo`, spec 051).
 *
 * `req.file` se mapea al mismo payload que usa el Servicio de escuelas
 * (`buffer`, `tipo`, `size`, `nombre`). Si no vino archivo se pasa `undefined`
 * para que el Servicio responda `ARCHIVO_REQUERIDO`.
 *
 * @param req - Objeto de solicitud HTTP: el archivo en `req.file` y los ids del token.
 * @param res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const actualizarLogoEscuela = async (req: Request, res: Response) => {
    const archivo = req.file
        ? {
            buffer: req.file.buffer,
            tipo: req.file.mimetype,
            size: req.file.size,
            nombre: req.file.originalname,
        }
        : undefined;

    const data = {
        id_escuela: req.usuario!.id_escuela,
        usuario_id: req.usuario!.id,
        archivo,
    };

    await handleControladores(res, data, servicioUsuario.actualizarLogoEscuela, MAPA_ESCUELA_LOGO_ACTUALIZADO);
};

/**
 * Controlador para quitar el logo de la escuela
 * (`DELETE /api/usuario_perfil/escuela/logo`, spec 051).
 *
 * No lleva body: el `id_escuela` y el `usuario_id` (para el historial) salen
 * del token. La operación es idempotente.
 *
 * @param req - Objeto de solicitud HTTP (usa los ids del token).
 * @param res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Resuelve tras enviar la respuesta HTTP.
 */
const quitarLogoEscuela = async (req: Request, res: Response) => {
    const data = {
        id_escuela: req.usuario!.id_escuela,
        usuario_id: req.usuario!.id,
    };

    await handleControladores(res, data, servicioUsuario.quitarLogoEscuela, MAPA_ESCUELA_LOGO_QUITADO);
};

export const method = {

    modMiPerfil       : tryCatch( modMiPerfil ),
    obtenerMiPerfil   : tryCatch( obtenerMiPerfil ),
    obtenerEscuelaPerfil : tryCatch( obtenerEscuelaPerfil ),
    actualizarLogoEscuela : tryCatch( actualizarLogoEscuela ),
    quitarLogoEscuela : tryCatch( quitarLogoEscuela ),

}