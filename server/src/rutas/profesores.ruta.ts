import { Router } from "express";
import { method as profesores } from "../controladores/profesores.controlador";

const rutas = Router();

rutas.post("/api/registro_profesor" , profesores.alta);
rutas.put("/api/usu_mod_profesor/:dni" , profesores.mod);
rutas.put("/api/usu_estado_profesor/:dni/:id_escuela/:estado" , profesores.estado);
rutas.get("/api/usu_listado_profesores" , profesores.listado);

export default rutas ;