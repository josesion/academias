import { Router } from "express";
import { method as controladorSuscripcion } from "../controladores/suscripcion.escuela.controlador";
import { validarPermiso } from "../utils/permisos";

const ruta = Router();

    ruta.post("/api/post_suspcripcion", validarPermiso, controladorSuscripcion.postSuscripcion);
    ruta.get("/api/lista_susp", validarPermiso, controladorSuscripcion.getSupcripcion);
    ruta.get("/api/esc_plan_list", validarPermiso, controladorSuscripcion.getEscPlan);
    ruta.put("/api/anular_susp/:id", validarPermiso, controladorSuscripcion.anularSuscripcion);
    ruta.get("/api/metricas_simples", validarPermiso, controladorSuscripcion.metricasSimples);

 export default ruta      