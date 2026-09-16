import { Router } from "express";
import { method as cuentasControlador } from "../controladores/cuentas.escuelas";
import { method as permisoSaas } from "../utils/permisosSaas";
import { method as permisos } from "../utils/permisos";

const rutas = Router();

rutas.post(
    "/api/alta_cuenta", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    cuentasControlador.crearCuentaEscuela
);

rutas.put(
    "/api/mod_cuenta/:id_cuenta", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    cuentasControlador.modCuentaEscuela
);

rutas.put(
    "/api/estado_cuenta/:id_cuenta/:estado", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    cuentasControlador.estadoCuentasEscuela
);

rutas.get(
    "/api/list_tipos_cuentas", 
    permisos.validarPermiso, 
    permisoSaas.verificarPlan(['basico', 'intermedio']), 
    cuentasControlador.listaCuentas
);

export default rutas;