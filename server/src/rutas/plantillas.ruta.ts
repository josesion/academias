import { Router } from "express";
import { method as controladorPlantillas } from "../controladores/plantillas.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post("/api/plantillas", permisos.validarPermiso, permisoSaas.verificarPlan(['basico','intermedio']), controladorPlantillas.alta);
ruta.get("/api/plantillas", permisos.validarPermiso, permisoSaas.verificarPlan(['basico','intermedio']), controladorPlantillas.listar);
ruta.delete("/api/plantillas/:id", permisos.validarPermiso, permisoSaas.verificarPlan(['basico','intermedio']), controladorPlantillas.baja);
ruta.post("/api/plantillas/:id/alumnos", permisos.validarPermiso, permisoSaas.verificarPlan(['basico','intermedio']), controladorPlantillas.agregarAlumnos);
ruta.delete("/api/plantillas/:id/alumnos/:dni", permisos.validarPermiso, permisoSaas.verificarPlan(['basico','intermedio']), controladorPlantillas.quitarAlumno);

export default ruta;