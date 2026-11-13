import { Router } from "express";
import { method as controladorRegistro } from "../controladores/registro.gratuito.controlador";

const ruta = Router();

ruta.get("/api/registro-escuela-gratuita/disponible-usuario/:usuario", controladorRegistro.disponibilidadUsuario);
ruta.post("/api/registro-escuela-gratuita", controladorRegistro.registroGratuito);

export default ruta;
