import { Router } from "express";
import { method as cajaControlador } from "../controladores/caja.controlador";

import { validarPermiso } from "../utils/permisos";

const ruta  =  Router();

 ruta.post("/api/caja_apertura", validarPermiso ,cajaControlador.abrirCajaTransaccion );
 ruta.post("/api/detalle_caja", validarPermiso ,cajaControlador.detalleCaja);
 ruta.post("/api/cierre_caja", validarPermiso ,cajaControlador.cierreCaja);
 ruta.get("/api/id_caja/:id_escuela", validarPermiso ,cajaControlador.idCajaAbierta);
 ruta.get("/api/metricas_caja/:id_caja/:id_escuela",  validarPermiso ,cajaControlador.listaMetricasCaja);
 ruta.get("/api/metricas_panel/:id_caja/:id_escuela", validarPermiso ,cajaControlador.metricasPanel);
 ruta.get("/api/movimientos_caja",  validarPermiso,cajaControlador.movimientosCaja);
 ruta.get("/api/lista_categoria_caja_tipos/:id_escuela/:tipo/:estado",  validarPermiso ,cajaControlador.listarCategoriaCajaTipos);
 ruta.get("/api/lista_tipos_cuentas/:id_escuela/:estado", validarPermiso , cajaControlador.listaTipoCuentas );

 export default ruta ;           