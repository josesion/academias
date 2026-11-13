import { Router } from "express";

import { method as authControlador } from "../controladores/auth.controlador";

const router = Router();

/**
 * POST /api/logout
 * Cierra la sesión borrando la cookie httpOnly `token`.
 * Público (sin middlewares de auth) para ser idempotente.
 */
router.post("/api/logout", authControlador.logout);

export default router;