import { Router } from "express";
import { method as permisos} from "../utils/permisos";
import { method as controladorHistorial } from "../controladores/historial.controlador";
const ruta = Router();

 ruta.get("/api/historial", permisos.validarPermiso, controladorHistorial.getHistorial);
 ruta.post('/api/post_historial', permisos.validarPermiso, controladorHistorial.postHistorial )

export default ruta;