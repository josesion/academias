import { Router } from "express";
import { method as permisos } from "../utils/permisos";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as controladorHistorial } from "../controladores/historial.controlador";

const ruta = Router();

ruta.get(
    "/api/historial", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHistorial.getHistorial
);

ruta.post(
    '/api/post_historial', 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorHistorial.postHistorial
);

export default ruta;