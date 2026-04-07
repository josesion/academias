import { Router } from "express";
import { method as cuentasControlador } from "../controladores/cuentas.escuelas";


const rutas = Router();

rutas.post("/api/alta_cuenta", cuentasControlador.crearCuentaEscuela);
rutas.put("/api/mod_cuenta/:id_cuenta/:id_escuela", cuentasControlador.modCuentaEscuela);

export default rutas;