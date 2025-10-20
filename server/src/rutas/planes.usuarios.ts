import { Router } from "express";
import { method as planesUsuarios } from "../controladores/planes.usuarios.controlador";


const ruta = Router();

ruta.post("/api/usu_planes", planesUsuarios .altaPlanes_usuarios);
ruta.put("/api/usu_mod_planes/:id_plan/:id_escuela", planesUsuarios.modPlanes_usuarios);
ruta.put("/api/usu_estado_planes/:id_plan/:id_escuela/:estado", planesUsuarios.estadoPlanes_usuarios);
ruta.get("/api/usu_listado_planes", planesUsuarios.listadoPlanesUsuarios);

export default ruta ;
