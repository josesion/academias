import { Router } from "express";
import { method as controladorTutores } from "../controladores/tutores.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

// Rutas de tutores protegidas con autenticación y verificación de plan SaaS
ruta.post(
    "/api/registro_tutor",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.altaTutor
);

ruta.get(
    "/api/listar_tutor",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.listarTutores
);

ruta.put(
    "/api/mod_tutor/:dni_tutor",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.modTutor
);

ruta.get(
    "/api/listar_tutor_sin_pag",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.listaTutorSinPag
);

ruta.delete(
    "/api/borrar_tutor/:id_tutor/:estado",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.borrarTutor
);

// Obtener tutores de un alumno por DNI
ruta.get(
    "/api/tutores_por_alumno/:dni_alumno",
    permisos.validarPermiso,
    permisoSaas.verificarPlan(['basico', 'intermedio']),
    controladorTutores.tutoresPorAlumno
);

export default ruta;
