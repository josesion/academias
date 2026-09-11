import { Router } from "express";
import { method as controladorMetricasAlumnos} from "../controladores/metricas.alumnos.controlador";
import { validarPermiso } from "../utils/permisos";


const ruta = Router();

    ruta.get("/api/metricas_principal_alumno/:correo", validarPermiso, controladorMetricasAlumnos.metricasPrincipal );
    ruta.get("/api/data_escuela_alumno/:correo/:id_escuela", validarPermiso, controladorMetricasAlumnos.dataEscuelaAlumno );
    ruta.get("/api/horario_escuela/:id_escuela", validarPermiso, controladorMetricasAlumnos.horarioEscuela );

 export default ruta    