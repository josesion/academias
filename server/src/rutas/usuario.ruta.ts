import { Router} from "express";
import { method as usuarioControlador } from "../controladores/usuario.controlador";
import { method as  permisos } from "../utils/permisos";
const ruta = Router();

ruta.put("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.modMiPerfil);
ruta.get("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.obtenerMiPerfil);

export default ruta;
