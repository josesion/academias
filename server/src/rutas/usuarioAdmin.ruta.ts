import { Router } from "express";
import { method as controladorUsuarioAdmin } from "../controladores/usuarioAdmin.controlador";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.get("/api/usuario_admin_lista_alumno", permisos.validarPermiso, controladorUsuarioAdmin.listarAlumnos);
ruta.get("/api/usuario_admin_lista_usuario", permisos.validarPermiso, controladorUsuarioAdmin.listarUsuarios);
ruta.post("/api/usuario_admin_alta", permisos.validarPermiso, permisos.soloAdministrador, controladorUsuarioAdmin.crear);
ruta.put("/api/usuario_admin_mod", permisos.validarPermiso, permisos.soloAdministrador, controladorUsuarioAdmin.actualizar);
ruta.delete("/api/usuario_admin_baja", permisos.validarPermiso, permisos.soloAdministrador, controladorUsuarioAdmin.eliminar);

export default ruta;
