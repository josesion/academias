import { Router } from "express";

import { method as controladorLogin } from "../controladores/login.controlador";
import { loginLimiter } from "../middleware/rateLimite";
const ruta = Router();

ruta.post("/api/login", loginLimiter ,controladorLogin.login);


export default ruta;