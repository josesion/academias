import { Router  } from "express";
import { method as adminControlador } from "../controladores/escuelas.controlador";
import { method as permisos, validarPermiso } from "../utils/permisos";
const rutas = Router();

rutas.get("/ping",permisos.validarPermiso, adminControlador.ping);
rutas.post("/api/post_escuelas" , validarPermiso, adminControlador.crearEscuela)

export default rutas;
