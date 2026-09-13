import { Router } from "express";
import { method as controladorPlanesSass } from "../controladores/planes.saas.controlador";
import { validarPermiso } from "../utils/permisos";

const ruta = Router();

    ruta.post("/api/planes_sass", validarPermiso, controladorPlanesSass.postPlanesSaas);
    ruta.put("/api/mod_planes_saas/:id", validarPermiso, controladorPlanesSass.modPlanesSass);
    ruta.put("/api/baja_planes_saas/:id", validarPermiso, controladorPlanesSass.bajaPlanesSass); 
    ruta.delete("/api/delete_planes_saas/:id", validarPermiso, controladorPlanesSass.deletPlanesSaas);
    ruta.get("/api/lista_planes_saas", validarPermiso, controladorPlanesSass.listaPlanesSaas);

 export default ruta    