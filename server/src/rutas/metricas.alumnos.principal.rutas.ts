import { Router } from "express";
import { method as controladorMetricasAlumnos} from "../controladores/metricas.alumnos.controlador";
import { method as permisos } from "../utils/permisos";


const ruta = Router();

    ruta.get("/api/metricas_principal_alumno/:correo", permisos.validarPermiso, controladorMetricasAlumnos.metricasPrincipal );
    ruta.get("/api/data_escuela_alumno/:correo/:id_escuela", permisos.validarPermiso, controladorMetricasAlumnos.dataEscuelaAlumno );
    ruta.get("/api/horario_escuela/:id_escuela", permisos.validarPermiso, controladorMetricasAlumnos.horarioEscuela );
    ruta.get("/api/asistencias_inscripcion/:id_inscripcion", permisos.validarPermiso, permisos.soloAlumno, controladorMetricasAlumnos.asistenciasInscripcion );



 export default ruta     