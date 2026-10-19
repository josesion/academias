import { Request, Response } from "express";


import { tryCatch } from "../utils/tryCatch";
import { handleControladores } from "../utils/handleControladores";
import { method as servicioUsuario } from "../Servicio/usuario.servicio";


import { MAPA_OBTENER_PERFIL, MAPA_MODIFICAR_PERFIL } from "../respuestas/usuario";


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




export const method = {

    modMiPerfil       : tryCatch( modMiPerfil ),
    obtenerMiPerfil   : tryCatch( obtenerMiPerfil ),

}