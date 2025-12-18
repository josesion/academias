import { Router } from "express";
import { method as controladorInscripcion } from "../controladores/horarios.controlador";
import { method as permisos} from "../utils/permisos";
const ruta = Router();

    ruta.post("/api/alta_horario" , permisos.validarPermiso ,controladorInscripcion.alta);
    ruta.get("/api/lista_horario", permisos.validarPermiso, controladorInscripcion.listadoHorarioEscuela)

export default ruta;