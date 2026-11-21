import { Router } from "express"; 
import { method as horariosGymControlador } from "../controladores/horarios_gym.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/alta_horario_gym", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    horariosGymControlador.alta
);

ruta.get(
    "/api/lista_horario_gym", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    horariosGymControlador.listadoHorarioGym
);

ruta.put(
    "/api/mod_horario_gym", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    horariosGymControlador.mod
);

ruta.delete(
    "/api/eliminar_horario_gym", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    horariosGymControlador.eliminar
);

export default ruta;
