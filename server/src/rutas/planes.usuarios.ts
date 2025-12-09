import { Router } from "express";
import { method as planesUsuarios } from "../controladores/planes.usuarios.controlador";
import { method as permisos} from "../utils/permisos";

const ruta = Router();

ruta.post("/api/usu_planes",permisos.validarPermiso,  planesUsuarios .altaPlanes_usuarios);
ruta.put("/api/usu_mod_planes/:id_plan/:id_escuela",permisos.validarPermiso,  planesUsuarios.modPlanes_usuarios);
ruta.put("/api/usu_estado_planes/:id_plan/:id_escuela/:estado",permisos.validarPermiso,  planesUsuarios.estadoPlanes_usuarios);
ruta.get("/api/usu_listado_planes",permisos.validarPermiso,  planesUsuarios.listadoPlanesUsuarios);
ruta.get("/api/listado_planes_sinpag", permisos.validarPermiso, planesUsuarios.listadoSinPag)

export default ruta ;
