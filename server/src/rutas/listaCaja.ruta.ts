import { Router } from "express";
import { method as listaCajasControlador } from "../controladores/listaCajas.controlador";
import { method as permisos} from "../utils/permisos";

    const ruta = Router();
    const { validarPermiso } = permisos;

    ruta.get("/api/estado_caja_historial", validarPermiso, listaCajasControlador.encabezadoHistorial);
    ruta.get("/api/list_estado_caja", validarPermiso, listaCajasControlador.estadoListaCaja);
    ruta.get("/api/usuarios_escuela", validarPermiso, listaCajasControlador.usuarioEscuela);
    ruta.get("/api/detalle_caja_resumen", validarPermiso , listaCajasControlador.libroDiario);

export default ruta;