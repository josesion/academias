import { Router } from "express";
import { method as cajaControlador } from "../controladores/caja.controlador";

import { validarPermiso } from "../utils/permisos";
import { method as permisos } from "../utils/permisos";

const ruta  =  Router();
const { validarCajaAbierta } = permisos;

// Rutas de apertura/cierre: NO requieren caja abierta
ruta.post("/api/caja_apertura", validarPermiso, cajaControlador.abrirCajaTransaccion);
ruta.get("/api/id_caja", validarPermiso, cajaControlador.idCajaAbierta);

// Rutas que requieren caja abierta
ruta.post("/api/detalle_caja", validarPermiso, validarCajaAbierta, cajaControlador.detalleCaja);
ruta.post("/api/cierre_caja", validarPermiso, validarCajaAbierta, cajaControlador.cierreCaja);
ruta.get("/api/metricas_caja/:id_caja", validarPermiso, validarCajaAbierta, cajaControlador.listaMetricasCaja);
ruta.get("/api/metricas_panel/:id_caja", validarPermiso, validarCajaAbierta, cajaControlador.metricasPanel);
ruta.get("/api/movimientos_caja", validarPermiso, validarCajaAbierta, cajaControlador.movimientosCaja);
ruta.get("/api/cuentas_sesion", validarPermiso, validarCajaAbierta, cajaControlador.cuentasSesion);

// Spec 050 — transferencias y retenciones (requieren caja abierta)
ruta.post("/api/transferencia_caja", validarPermiso, validarCajaAbierta, cajaControlador.transferenciaCaja);
ruta.post("/api/retencion_caja", validarPermiso, validarCajaAbierta, cajaControlador.registrarRetencion);
ruta.get("/api/retenciones_activas/:id_caja", validarPermiso, validarCajaAbierta, cajaControlador.retencionesActivas);
ruta.post("/api/devolver_retencion", validarPermiso, validarCajaAbierta, cajaControlador.devolverRetencion);
ruta.post("/api/justificar_retencion", validarPermiso, validarCajaAbierta, cajaControlador.justificarRetencion);

// Listados de configuración: NO requieren caja abierta
ruta.get("/api/lista_categoria_caja_tipos/:tipo/:estado", validarPermiso, cajaControlador.listarCategoriaCajaTipos);
ruta.get("/api/lista_tipos_cuentas/:estado", validarPermiso, cajaControlador.listaTipoCuentas);

export default ruta;