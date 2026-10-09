import { Router } from "express";

import { method as permisos } from "../utils/permisos";
import { method as controladorAnuncio } from "../controladores/anuncio.controlador";
import { uploadAnuncio } from "../middleware/upload";

const ruta = Router();

// --- Anuncios (spec 015) ---
// Todas las rutas son solo rol administrador: `soloAdministrador` va DESPUES de
// `validarPermiso`, que es quien llena `req.usuario`.
//
// Las dos de escritura usan `uploadAnuncio` (NO el `upload` de las imagenes):
// ese middleware acepta imagen y video y sube el tope de multer a 50 MB, que es
// el techo absoluto. El tope real de cada tipo lo aplica el Servicio, para poder
// responder 400 con codigo propio en vez de un 500 de multer.

/** Alta de anuncio. La media (imagen o video) es obligatoria. */
ruta.post(
    "/api/anuncio_alta",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    uploadAnuncio.single("media"),
    controladorAnuncio.crear
);

/** Modificacion de anuncio. La media es opcional: si no viene, se conserva. */
ruta.put(
    "/api/anuncio_mod",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    uploadAnuncio.single("media"),
    controladorAnuncio.actualizar
);

/** Baja FISICA: borra el objeto de R2 y la fila. */
ruta.delete(
    "/api/anuncio_baja",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorAnuncio.eliminar
);

/** Listado paginado con los 5 filtros. */
ruta.get(
    "/api/anuncio_lista",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorAnuncio.listar
);

/** Listado sin paginacion de los anuncios de una empresa. */
ruta.get(
    "/api/anuncio_lista_empresa",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorAnuncio.listarPorEmpresa
);

export default ruta;