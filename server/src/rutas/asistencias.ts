import { Router } from "express";
import { method as controladorAsistencias } from "../controladores/asistencias.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/asistencia", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAsistencias.asistencia
);

ruta.get(
    "/api/asistencia_fechas/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAsistencias.fechasHorarios
);

ruta.get(
    "/api/data_asitencia/:dni/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAsistencias.dataAsistencia
);

export default ruta;