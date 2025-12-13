import { Router } from "express";
import { method as controladorInscripcion } from "../controladores/horarios.controlador";
import { method as permisos} from "../utils/permisos";
const ruta = Router();

    ruta.post("/api/alta_horario" , permisos.validarPermiso ,controladorInscripcion.alta);

export default ruta;