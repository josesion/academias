import { Router } from "express";

import { method as permisos } from "../utils/permisos";
import { method as controladorLog } from "../controladores/log.controlador";

const ruta = Router();

/** Listado paginado de eventos del sistema. Solo rol administrador. */
ruta.get(
    "/api/logs_eventos",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorLog.listar
);

/** Marca (o desmarca) un evento como revisado. Solo rol administrador. */
ruta.put(
    "/api/logs_eventos_marcar",
    permisos.validarPermiso,
    permisos.soloAdministrador,
    controladorLog.marcar
);

export default ruta;
