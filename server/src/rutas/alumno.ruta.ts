import { Router } from "express";
import { method as controladorAlumnos } from "../controladores/alumno.controlador";
import { method as permisos} from "../utils/permisos";

const ruta = Router();

// al terminar las rutas agregar verificaciond de token
ruta.post("/api/registro_alumno" ,permisos.validarPermiso ,controladorAlumnos.altaAlumno);
ruta.get("/api/listar_alumno"     ,permisos.validarPermiso ,controladorAlumnos.listarAlumno);
ruta.put("/api/mod_alumno/:dni/:id_escuela" ,permisos.validarPermiso , controladorAlumnos.modAlumno);
ruta.delete("/api/borrar_alumno/:dni/:id_escuela/:estado" ,permisos.validarPermiso , controladorAlumnos.borrarAlumno);



export default ruta;