import { Router} from "express";
import { method as usuarioControlador } from "../controladores/usuario.controlador";
import { method as  permisos } from "../utils/permisos";
import { uploadLogo } from "../middleware/upload";
const ruta = Router();

ruta.put("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.modMiPerfil);
ruta.get("/api/usuario_perfil", permisos.validarPermiso, usuarioControlador.obtenerMiPerfil);

// --- Logo de la escuela en el perfil (spec 051) ---
// El GET lo puede llamar cualquier rol autenticado (el alumno ve el logo).
// El PUT y el DELETE son solo del dueño de la escuela (`usuario`).
// `uploadLogo` va DESPUES de los permisos: no se bufferearn 50 MB de alguien
// que igual va a recibir 403.
ruta.get(
    "/api/usuario_perfil/escuela",
    permisos.validarPermiso,
    usuarioControlador.obtenerEscuelaPerfil
);

ruta.put(
    "/api/usuario_perfil/escuela/logo",
    permisos.validarPermiso,
    permisos.soloUsuario,
    uploadLogo.single("imagen"),
    usuarioControlador.actualizarLogoEscuela
);

ruta.delete(
    "/api/usuario_perfil/escuela/logo",
    permisos.validarPermiso,
    permisos.soloUsuario,
    usuarioControlador.quitarLogoEscuela
);

export default ruta;
