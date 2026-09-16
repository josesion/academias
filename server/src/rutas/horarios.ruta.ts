import { Router } from "express";
import { method as controladorHorario } from "../controladores/horarios.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/alta_horario", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHorario.alta
);

ruta.get(
    "/api/lista_horario", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHorario.listadoHorarioEscuela
);

ruta.put(
    "/api/mod_horario", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHorario.mod
);

ruta.delete(
    "/api/eliminar_horario", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHorario.eliminar
);

export default ruta;