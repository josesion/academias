import { Router } from "express";

import { method as controladorLogin } from "../controladores/login.controlador";

const ruta = Router();

ruta.post("/api/login", controladorLogin.login);

export default ruta;