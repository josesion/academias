import { Router } from "express";
import { method as controladorTipo } from "../controladores/tipo_clase.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/alta_tipo_usu", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorTipo.registro
);

ruta.put(
    "/api/mod_tipo_usu/:id", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorTipo.modTipo
);

ruta.put(
    "/api/estado_tipo_usu/:id/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorTipo.estado
);

ruta.get(
    "/api/lista_tipo_usu", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorTipo.listado
);

ruta.get(
    "/api/lista_tipo_usu_sin_pag", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    controladorTipo.listadoSinPaginacion
);

export default ruta;