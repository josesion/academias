import { Router } from "express";
import { method as controladorAlumnos } from "../controladores/alumno.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

// Rutas de alumnos protegidas con autenticación y verificación de plan SaaS (disponible para básico e intermedio)
ruta.post(
    "/api/registro_alumno", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAlumnos.altaAlumno
);

ruta.get(
    "/api/listar_alumno", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAlumnos.listarAlumno
);

ruta.put(
    "/api/mod_alumno/:dni", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAlumnos.modAlumno
);

ruta.get(
    "/api/listar_alumno_sin_pag", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAlumnos.listaAlumnoSinPag
);

ruta.delete(
    "/api/borrar_alumno/:dni/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorAlumnos.borrarAlumno
);

export default ruta;