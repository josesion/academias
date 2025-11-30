import { Router } from "express";
import { method as controladorTipo } from "../controladores/tipo_clase.controlador";
import { method as permisos} from "../utils/permisos";

const ruta = Router();

ruta.post("/api/alta_tipo_usu", permisos.validarPermiso ,controladorTipo.registro);
ruta.put("/api/mod_tipo_usu/:id/:id_escuela",permisos.validarPermiso ,controladorTipo.modTipo);
ruta.put("/api/estado_tipo_usu/:id/:id_escuela/:estado",permisos.validarPermiso ,controladorTipo.estado);
ruta.get("/api/lista_tipo_usu",permisos.validarPermiso ,controladorTipo.listado);

export default ruta;