import { Router } from "express";
import { method as controladorHorario } from "../controladores/horarios.controlador";
import { method as permisos} from "../utils/permisos";
const ruta = Router();

    ruta.post("/api/alta_horario" , permisos.validarPermiso ,controladorHorario.alta);
    ruta.get("/api/lista_horario", permisos.validarPermiso, controladorHorario.listadoHorarioEscuela);
    ruta.put("/api/mod_horario" , permisos.validarPermiso , controladorHorario.mod);
    ruta.delete("/api/eliminar_horario",permisos.validarPermiso, controladorHorario.eliminar);

export default ruta;