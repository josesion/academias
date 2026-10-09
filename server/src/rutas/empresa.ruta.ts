import { Router } from "express";

import { method as permisos } from "../utils/permisos";
import { method as controladorEmpresa } from "../controladores/empresa.controlador";
import { uploadLogo } from "../middleware/upload";

const ruta = Router();

// --- Empresas (spec 015) ---
// Todas las rutas son solo rol administrador: `soloAdministrador` va DESPUES de
// `validarPermiso`, que es quien llena `req.usuario`.

/** Alta de empresa. El logo es opcional y lo valida el Servicio con 400. */
ruta.post(
    "/api/empresa_alta",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    uploadLogo.single("logo"),
    controladorEmpresa.crear
);

/** Modificacion de empresa. El logo tambien es opcional (reemplaza el anterior). */
ruta.put(
    "/api/empresa_mod",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    uploadLogo.single("logo"),
    controladorEmpresa.actualizar
);

/** Baja LOGICA: la fila queda con `estado = 'inactivos'`. */
ruta.delete(
    "/api/empresa_baja",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorEmpresa.eliminar
);

/** Listado paginado. Sin `estado` trae solo las activas. */
ruta.get(
    "/api/empresa_lista",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorEmpresa.listar
);

export default ruta;