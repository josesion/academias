import { Router } from "express";
import { method as controladorAsistencias } from "../controladores/asistencias.controlador";
import { method as permisos} from "../utils/permisos";
const ruta = Router();

ruta.post("/api/asistencia",permisos.validarPermiso , controladorAsistencias.asistencia);
ruta.get("/api/asistencia_fechas/:id_escuela/:estado", permisos.validarPermiso ,controladorAsistencias.fechasHorarios);
ruta.get("/api/data_asitencia/:id_escuela/:dni/:estado", permisos.validarPermiso ,controladorAsistencias.dataAsistencia);

export default ruta;