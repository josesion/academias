import { Router } from "express";
import { method as controladorInscripcion } from "../controladores/horarios.controlador";

const ruta = Router();

    ruta.post("/api/alta_horario" , controladorInscripcion.alta);

export default ruta;