import { Router  } from "express";
import { method as adminControlador } from "../controladores/admin.controlador";
import { method as permisos } from "../utils/permisos";
const rutas = Router();

rutas.get("/ping",permisos.validarPermiso, adminControlador.ping);


export default rutas;
