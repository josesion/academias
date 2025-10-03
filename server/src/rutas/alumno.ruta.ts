import { Router } from "express";

import { method as controladorAlumnos } from "../controladores/alumno.controlador";

const ruta = Router();

// al terminar las rutas agregar verificaciond de token
ruta.post("/api/registro_alumno" ,controladorAlumnos.altaAlumno);
ruta.get("/api/listar_alumno"   , controladorAlumnos.listarAlumno);
ruta.put("/api/mod_alumno/:dni/:id_escuela" , controladorAlumnos.modAlumno);



export default ruta;