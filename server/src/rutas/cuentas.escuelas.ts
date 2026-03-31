import { Router } from "express";
import { method as cuentasControlador } from "../controladores/cuentas.escuelas";


const rutas = Router();

rutas.post("", cuentasControlador.crearCuentaEscuela);

export default rutas;