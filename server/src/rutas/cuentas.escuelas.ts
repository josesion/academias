import { Router } from "express";
import { method as cuentasControlador } from "../controladores/cuentas.escuelas";
import { method as permisos} from "../utils/permisos";


const rutas = Router();

rutas.post("/api/alta_cuenta" ,permisos.validarPermiso ,cuentasControlador.crearCuentaEscuela);
rutas.put("/api/mod_cuenta/:id_cuenta/:id_escuela",permisos.validarPermiso ,cuentasControlador.modCuentaEscuela);
rutas.put("/api/estado_cuenta/:id_cuenta/:id_escuela/:estado",permisos.validarPermiso , cuentasControlador.estadoCuentasEscuela);
rutas.get("/api/list_tipos_cuentas",permisos.validarPermiso , cuentasControlador.listaCuentas);

export default rutas;