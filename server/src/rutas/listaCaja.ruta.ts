import { Router } from "express";
import { method as listaCajasControlador } from "../controladores/listaCajas.controlador";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const ruta = Router();
const { validarPermiso } = permisos;

ruta.get(
    "/api/estado_caja_historial", 
    validarPermiso, 
    permisoSaas.verificarPlan('intermedio'), 
    listaCajasControlador.encabezadoHistorial
);

ruta.get(
    "/api/list_estado_caja", 
    validarPermiso, 
    permisoSaas.verificarPlan('intermedio'), 
    listaCajasControlador.estadoListaCaja
);

ruta.get(
    "/api/usuarios_escuela", 
    validarPermiso, 
    permisoSaas.verificarPlan('intermedio'), 
    listaCajasControlador.usuarioEscuela
);

ruta.get(
    "/api/detalle_caja_resumen", 
    validarPermiso, 
    permisoSaas.verificarPlan('intermedio'), 
    listaCajasControlador.libroDiario
);

export default ruta;