import { Router } from "express";

import { method as permisos } from "../utils/permisos";
import { method as controladorFlayer } from "../controladores/flayer.controlador";
import { upload } from "../middleware/upload"; 

const ruta = Router();

ruta.post("/api/flayer", permisos.validarPermiso, upload.single("imagen"), controladorFlayer.postFlayer);
ruta.get("/api/get_flayer", permisos.validarPermiso, controladorFlayer.getFlayers);
ruta.get("/api/get_flayer_escuela", permisos.validarPermiso, controladorFlayer.getFlayerEscuela);
ruta.get("/api/delete_flayer_escuela/:idflayer", permisos.validarPermiso, controladorFlayer.deleteFlayerEscuela);


export default ruta;