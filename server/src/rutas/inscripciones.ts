import { Router } from "express";
import { method as controladorInscripciones } from "../controladores/inscripciones.controlador"; 
import { method as permisos} from "../utils/permisos";

const rutas = Router();

rutas.post("/api/inscripcion", permisos.validarPermiso ,controladorInscripciones.inscripcion);

export default rutas;