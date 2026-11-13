import { Router } from "express";
import { method as controladorPlantillas } from "../controladores/plantillas.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.post("/api/plantillas", permisos.validarPermiso, permisoSaas.verificarPlan(['basico', 'intermedio']), controladorPlantillas.alta);
rutas.get("/api/plantillas", permisos.validarPermiso, permisoSaas.verificarPlan(['basico', 'intermedio']), controladorPlantillas.listar);
rutas.delete("/api/plantillas/:id", permisos.validarPermiso, permisoSaas.verificarPlan(['basico', 'intermedio']), controladorPlantillas.baja);
rutas.post("/api/plantillas/:id/alumnos", permisos.validarPermiso, permisoSaas.verificarPlan(['basico', 'intermedio']), controladorPlantillas.agregarAlumnos);
rutas.delete("/api/plantillas/:id/alumnos/:dni", permisos.validarPermiso, permisoSaas.verificarPlan(['basico', 'intermedio']), controladorPlantillas.quitarAlumno);

export default rutas;
