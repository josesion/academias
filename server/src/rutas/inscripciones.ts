import { Router } from "express";
import { method as controladorInscripciones } from "../controladores/inscripciones.controlador"; 
import { method as permisos} from "../utils/permisos";

const rutas = Router();

rutas.post("/api/inscripcion", permisos.validarPermiso ,controladorInscripciones.inscripcion);
rutas.get("/api/list_inscrip", controladorInscripciones.listadoInscripciones );
rutas.post("/api/anular_inscrip", controladorInscripciones.anularInscripcion);

export default rutas;