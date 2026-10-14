import { Router} from "express";
import { method as usuarioControlador } from "../controladores/usuario.controlador";
import { method as  permisos } from "../utils/permisos";
const ruta = Router();

ruta.post("/api/usuario_alta",  usuarioControlador.crearUsuario );
ruta.put("/api/usuario_mod/:usuario" , permisos.validarPermiso, usuarioControlador.modUsuarioPublic);
ruta.put("/api/usuario_mod_priv/:usuario",permisos.validarPermiso, usuarioControlador.modUsuarioPrivado);
ruta.put("/api/usuario_mod_p/:usuario",permisos.validarPermiso, usuarioControlador.modUsuarioContrasena);
ruta.put("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.modMiPerfil);
ruta.get("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.obtenerMiPerfil);
ruta.get("/api/lista_usuario",permisos.validarPermiso, usuarioControlador.listadoUsuario);

export default ruta;
