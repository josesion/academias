import { Router } from "express";
import { method as controladorSuscripcion } from "../controladores/suscripcion.escuela.controlador";
import { validarPermiso } from "../utils/permisos";

const ruta = Router();

    ruta.post("/api/post_suspcripcion", validarPermiso, controladorSuscripcion.postSuscripcion);
    ruta.get("/api/lista_susp", validarPermiso, controladorSuscripcion.getSupcripcion);

 export default ruta      