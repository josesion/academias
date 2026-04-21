import { Router } from "express";

import { method as controladorProtegido } from "../controladores/rutas.protegidas";

const ruta = Router();

ruta.get("/api/verificar", controladorProtegido.verificarSesion);

export default ruta;