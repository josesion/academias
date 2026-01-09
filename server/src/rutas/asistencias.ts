import { Router } from "express";
import { method as controladorAsistencias } from "../controladores/asistencias.controlador";
const ruta = Router();

ruta.post("/api/asistencia", controladorAsistencias.asistencia);
ruta.get("/api/asistencia_fechas/:id_escuela/:estado", controladorAsistencias.fechasHorarios);

export default ruta;