import { Router } from "express";

import { method as permisos } from "../utils/permisos";
import { method as controladorFlayer } from "../controladores/flayer.controlador";
import { upload } from "../middleware/upload"; 

const ruta = Router();

ruta.post("/api/flayer", permisos.validarPermiso, upload.single("imagen"), controladorFlayer.postFlayer,);

export default ruta;