import { Router } from "express";
import { method as cajaControlador } from "../controladores/caja.controlador";
const ruta  =  Router();

 ruta.post("/api/caja_apertura", cajaControlador.abrirCaja );
 ruta.post("/api/detalle_caja", cajaControlador.detalleCaja);
 ruta.post("/api/cierre_caja", cajaControlador.cierreCaja)


 export default ruta ;