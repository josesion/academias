import { Router } from "express";
import { method as controladorAsistencias } from "../controladores/asistencias.controlador";
const ruta = Router();

ruta.post("/api/asistencia", controladorAsistencias.asistencia);

export default ruta;