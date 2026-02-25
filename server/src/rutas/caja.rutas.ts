import { Router } from "express";
import { method as cajaControlador } from "../controladores/caja.controlador";
const ruta  =  Router();

 ruta.post("/api/caja_apertura", cajaControlador.abrirCaja );
 ruta.post("/api/detalle_caja", cajaControlador.detalleCaja);
 ruta.post("/api/cierre_caja", cajaControlador.cierreCaja);
 ruta.get("/api/id_caja/:id_escuela", cajaControlador.idCajaAbierta);
 ruta.get("/api/metricas_caja/:id_caja/:id_escuela",cajaControlador.metricasPanelCaja);
 ruta.get("/api/movimientos_caja", cajaControlador.movimientosCaja);
 ruta.get("/api/lista_categoria_caja_tipos/:id_escuela/:tipo/:estado", cajaControlador.listarCategoriaCajaTipos);


 export default ruta ;