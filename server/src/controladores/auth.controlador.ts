import { Request, Response } from "express";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { CodigoEstadoHTTP } from "../tipados/generico";

/**
 * Controlador de Auth: manejo de cierre de sesión.
 *
 * Borra la cookie `token` (httpOnly) para invalidar la sesión del lado del cliente.
 * Es público (sin validarPermiso) para ser idempotente: si la cookie ya no está,
 * igual responde 200.
 *
 * @async
 * @function logout
 * @param {Request} req - Petición de Express.
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<Response>} 200 con cookie borrada.
 */
const logout = async (_req: Request, res: Response) => {
  const esProduccion = process.env.NODE_ENV === "production";

  // Mismos atributos que `crearCookie()` en jwt.ts para que clearCookie funcione
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: esProduccion,
    sameSite: esProduccion ? "none" : "lax",
  });

  return enviarResponse(
    res,
    CodigoEstadoHTTP.OK,
    "Sesión cerrada correctamente",
    undefined,
    undefined,
    "LOGOUT_OK"
  );
};

export const method = {
  logout: tryCatch(logout),
};