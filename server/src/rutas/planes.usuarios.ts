import { Router } from "express";
import { method as planesUsuarios } from "../controladores/planes.usuarios.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post(
    "/api/usu_planes", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    planesUsuarios.altaPlanes_usuarios
);

ruta.put(
    "/api/usu_mod_planes/:id_plan", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    planesUsuarios.modPlanes_usuarios
);

ruta.put(
    "/api/usu_estado_planes/:id_plan/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    planesUsuarios.estadoPlanes_usuarios
);

ruta.get(
    "/api/usu_listado_planes", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    planesUsuarios.listadoPlanesUsuarios
);

ruta.get(
    "/api/listado_planes_sinpag", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    planesUsuarios.listadoSinPag
);

export default ruta;