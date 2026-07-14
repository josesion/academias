import { Router } from "express";
import { method as controladorMetricas } from "../controladores/metricas.controlador";
import { method as permisos} from "../utils/permisos";
const ruta = Router();

ruta.get("/api/metricas_tarjetas", permisos.validarPermiso, controladorMetricas.metricaInscripcion);
ruta.get("/api/metricas_clase", permisos.validarPermiso, controladorMetricas.encabezadoClases);
ruta.get("/api/metrica_asistencia", permisos.validarPermiso, controladorMetricas.asistenciaClases);

export default ruta;