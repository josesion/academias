import { Router } from "express";
import { method as profesores } from "../controladores/profesores.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.post(
    "/api/registro_profesor", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    profesores.alta
);

rutas.put(
    "/api/usu_mod_profesor/:dni", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    profesores.mod
);

rutas.put(
    "/api/usu_estado_profesor/:dni/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    profesores.estado
);

rutas.get(
    "/api/usu_listado_profesores", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    profesores.listado
);

rutas.get(
    "/api/usu_listado_profesores_sin_paginacion", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    profesores.listadoSinPaginacion
);

export default rutas;