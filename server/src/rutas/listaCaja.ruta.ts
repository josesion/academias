import { Router } from "express";
import { method as listaCajasControlador } from "../controladores/listaCajas.controlador";
import { method as permisos} from "../utils/permisos";

    const ruta = Router();
    const { validarPermiso } = permisos;
    ruta.get("/api/list_estado_caja", validarPermiso, listaCajasControlador.estadoListaCaja)

export default ruta;