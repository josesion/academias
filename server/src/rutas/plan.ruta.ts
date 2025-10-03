import { Router } from "express";
import { method as planesControlador } from "../controladores/planes.controlador";
import { method as permisos } from "../utils/permisos";

const ruta = Router();

ruta.post("/api/planes_alta",  permisos.validarPermiso, planesControlador.crearPlane);
ruta.get("/api/planes_listar", permisos.validarPermiso, planesControlador.listarPlanes );
ruta.put("/api/mod_planes/:id",permisos.validarPermiso, planesControlador.modPlanes);

export default ruta;