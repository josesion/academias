import { Router } from "express";
import { method as controladorInscripciones } from "../controladores/inscripciones.controlador"; 

const rutas = Router();

rutas.post("/api/inscripcion", controladorInscripciones.inscripcion);

export default rutas;