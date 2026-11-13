import { Router  } from "express";
import { method as adminControlador } from "../controladores/escuelas.controlador";
import { method as permisos, validarPermiso } from "../utils/permisos";
import { upload } from "../middleware/upload"; 

const rutas = Router();

rutas.get("/ping",permisos.validarPermiso, adminControlador.ping);
rutas.post("/api/post_escuelas" , validarPermiso, upload.single("imagen"), adminControlador.crearEscuela);
rutas.put("/api/mod_escuelas", validarPermiso,upload.single("imagen") ,adminControlador.modEscuelas );
rutas.put("/api/estado_escuela/:estado/:id_escuela", validarPermiso, adminControlador.estadoEscuela);
rutas.get("/api/lista_escuelas", validarPermiso,  adminControlador.listadoEscuela);


export default rutas;
