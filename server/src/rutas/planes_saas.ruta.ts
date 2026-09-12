import { Router } from "express";
import { method as controladorPlanesSass } from "../controladores/planes.saas,controlador";
import { validarPermiso } from "../utils/permisos";

const ruta = Router();

    ruta.post("/api/planes_sass", validarPermiso, controladorPlanesSass.postPlanesSaas);

 export default ruta    