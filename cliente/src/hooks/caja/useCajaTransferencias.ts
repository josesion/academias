import { useEffect } from "react";
import { peticionComunicacion } from "../../utils/canalComunicacion";

import type {
  CajaTipado,
  CajaAction,
} from "../../reducers/cajaReducers";

import type {
  RetencionActiva,
} from "../../tipadosTs/caja.typado";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface TransferenciasRetencionesConfig {
  servicios: {
    transferenciaCaja: ServicioCrud;
    registrarRetencion: ServicioCrud;
    retencionesActivas: ServicioCrud;
    devolverRetencion: ServicioCrud;
    justificarRetencion: ServicioCrud;
  };
  state: CajaTipado;
  dispatch: React.Dispatch<CajaAction>;
  dispatchMetricas: React.Dispatch<any>;
}

/**
 * Hook con la lógica de la spec 050: transferencias internas entre cuentas y
 * retenciones de efectivo.
 *
 * Mantiene el listado de retenciones activas sincronizado con la caja abierta y
 * expone los handlers de los formularios de transferencia, retención, devolución
 * y justificación.
 *
 * @param {TransferenciasRetencionesConfig} config - Servicios, estado y dispatchers de caja.
 */
export const useCajaTransferencias = (config: TransferenciasRetencionesConfig) => {
  const { state, dispatch, dispatchMetricas } = config;

  /**
   * Refresca los datos que dependen de movimientos de caja: panel principal,
   * historial, métricas por cuenta y listado de retenciones.
   */
  const refrescarCaja = () => {
    peticionComunicacion({
      nombreCanal: "canal_actualizar_metricas_principal",
      mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
      dispatchError: dispatchMetricas,
      error: "SET_ERROR_METRICAS_TARJETAS",
    });

    peticionComunicacion({
      nombreCanal: "canal_actualizar_metricas_historial",
      mensaje: "ACTUALIZAR_HISTORIAL",
      dispatchError: dispatchMetricas,
      error: "SET_ERROR_HISTORIAL",
    });

    dispatch({ type: "DISPARAR_REFRESCO" });
    dispatch({ type: "ACTUALIZAR_METODO_PAGO" });
  };

  // ──────────────────────────────────────────────────────────────
  // Retenciones activas de la caja
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const idCaja = state.dataCaja.id_caja;

    if (!idCaja) {
      dispatch({ type: "SET_RETENCIONES_ACTIVAS", payload: [] });
      return;
    }

    const cargarRetenciones = async () => {
      dispatch({ type: "SET_CARGA_RETENCIONES_ACTIVAS", payload: true });

      try {
        const resultado = await config.servicios.retencionesActivas({ id_caja: idCaja });

        if (resultado.code === "RETENCIONES_ACTIVAS_OK" && Array.isArray(resultado.data)) {
          dispatch({ type: "SET_RETENCIONES_ACTIVAS", payload: resultado.data });
        } else {
          dispatch({ type: "SET_RETENCIONES_ACTIVAS", payload: [] });
        }
      } catch (error) {
        console.error('[useCajaTransferencias] Error al cargar retenciones:', error);
        dispatch({ type: "SET_RETENCIONES_ACTIVAS", payload: [] });
      } finally {
        dispatch({ type: "SET_CARGA_RETENCIONES_ACTIVAS", payload: false });
      }
    };

    cargarRetenciones();
  }, [state.dataCaja.id_caja, state.disparadorRefresco, state.actualizarCaja, state.estadoCaja]);

  // ──────────────────────────────────────────────────────────────
  // Transferencia entre cuentas
  // ──────────────────────────────────────────────────────────────

  const handleAbrirTransferencia = () => {
    if (!state.dataCaja.id_caja) {
      dispatch({ type: "SET_ERROR", payload: "La caja está cerrada" });
      return;
    }

    dispatch({ type: "RESET_TRANSFERENCIA_CAJA" });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "ABRIR_MODAL", payload: "transferencia" });
  };

  const handleCerrarTransferencia = () => {
    dispatch({ type: "RESET_TRANSFERENCIA_CAJA" });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "CERRAR_MODALES" });
  };

  const handleTransferenciaChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    dispatch({
      type: "UPDATE_TRANSFERENCIA_CAJA",
      payload: {
        campo: name as "id_cuenta_origen" | "id_cuenta_destino" | "monto" | "descripcion",
        valor: name === "descripcion" ? value : value === "" ? "" : Number(value),
      },
    });
  };

  const handleRegistrarTransferencia = async () => {
    const form = state.transferenciaCaja;

    if (!state.dataCaja.id_caja) {
      dispatch({ type: "SET_ERROR", payload: "La caja está cerrada" });
      return;
    }

    if (!form.id_cuenta_origen || !form.id_cuenta_destino) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná la cuenta de origen y la de destino" });
      return;
    }

    if (form.id_cuenta_origen === form.id_cuenta_destino) {
      dispatch({ type: "SET_ERROR", payload: "La cuenta de origen y la de destino deben ser distintas" });
      return;
    }

    if (form.monto === "" || Number(form.monto) <= 0) {
      dispatch({ type: "SET_ERROR", payload: "Ingresá un monto mayor a cero" });
      return;
    }

    dispatch({ type: "SET_CARGA_TRANSFERENCIA", payload: true });

    try {
      const resultado = await config.servicios.transferenciaCaja({
        id_cuenta_origen: Number(form.id_cuenta_origen),
        id_cuenta_destino: Number(form.id_cuenta_destino),
        monto: Number(form.monto),
        descripcion: form.descripcion,
      });

      if (resultado.code === "TRANSFERENCIA_OK") {
        refrescarCaja();
        dispatch({ type: "RESET_TRANSFERENCIA_CAJA" });
        dispatch({ type: "SET_ERROR", payload: null });
        dispatch({ type: "CERRAR_MODALES" });
      } else {
        dispatch({ type: "SET_ERROR", payload: resultado.message });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error en el servidor al registrar la transferencia" });
    } finally {
      dispatch({ type: "SET_CARGA_TRANSFERENCIA", payload: false });
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Retención de efectivo
  // ──────────────────────────────────────────────────────────────

  const handleAbrirRetencion = () => {
    if (!state.dataCaja.id_caja) {
      dispatch({ type: "SET_ERROR", payload: "La caja está cerrada" });
      return;
    }

    dispatch({ type: "RESET_RETENCION_CAJA" });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "ABRIR_MODAL", payload: "retencion" });
  };

  const handleCerrarRetencion = () => {
    dispatch({ type: "RESET_RETENCION_CAJA" });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "CERRAR_MODALES" });
  };

  const handleRetencionChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    dispatch({
      type: "UPDATE_RETENCION_CAJA",
      payload: {
        campo: name as "id_cuenta" | "monto" | "descripcion",
        valor: name === "descripcion" ? value : value === "" ? "" : Number(value),
      },
    });
  };

  const handleRegistrarRetencion = async () => {
    const form = state.retencionCaja;

    if (!state.dataCaja.id_caja) {
      dispatch({ type: "SET_ERROR", payload: "La caja está cerrada" });
      return;
    }

    if (!form.id_cuenta) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná la cuenta de la retención" });
      return;
    }

    if (form.monto === "" || Number(form.monto) <= 0) {
      dispatch({ type: "SET_ERROR", payload: "Ingresá un monto mayor a cero" });
      return;
    }

    dispatch({ type: "SET_CARGA_RETENCION", payload: true });

    try {
      const resultado = await config.servicios.registrarRetencion({
        id_cuenta: Number(form.id_cuenta),
        monto: Number(form.monto),
        descripcion: form.descripcion,
      });

      if (resultado.code === "RETENCION_OK") {
        refrescarCaja();
        dispatch({ type: "RESET_RETENCION_CAJA" });
        dispatch({ type: "SET_ERROR", payload: null });
        dispatch({ type: "CERRAR_MODALES" });
      } else {
        dispatch({ type: "SET_ERROR", payload: resultado.message });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error en el servidor al registrar la retención" });
    } finally {
      dispatch({ type: "SET_CARGA_RETENCION", payload: false });
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Devolución / justificación de retenciones activas
  // ──────────────────────────────────────────────────────────────

  const handleSeleccionarRetencion = (retencion: RetencionActiva) => {
    if (state.retencionSeleccionada === retencion.id_movimiento) {
      dispatch({ type: "RESET_DEVOLUCION_RETENCION" });
      return;
    }

    dispatch({ type: "SET_RETENCION_SELECCIONADA", payload: retencion.id_movimiento });
    dispatch({
      type: "UPDATE_DEVOLUCION_RETENCION",
      payload: { campo: "monto", valor: String(retencion.monto) },
    });
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const handleDevolucionRetencionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    dispatch({
      type: "UPDATE_DEVOLUCION_RETENCION",
      payload: { campo: name as "monto" | "observacion", valor: value },
    });
  };

  const handleDevolverRetencion = async () => {
    const retencion = state.retencionesActivas.find(
      (item) => item.id_movimiento === state.retencionSeleccionada,
    );

    if (!retencion) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná una retención activa" });
      return;
    }

    const monto = Number(state.devolucionRetencion.monto);

    if (state.devolucionRetencion.monto === "" || Number.isNaN(monto) || monto <= 0) {
      dispatch({ type: "SET_ERROR", payload: "Ingresá un monto devuelto mayor a cero" });
      return;
    }

    if (monto > Number(retencion.monto)) {
      dispatch({ type: "SET_ERROR", payload: "No se puede devolver más de lo retenido" });
      return;
    }

    const observacion = state.devolucionRetencion.observacion.trim();

    if (monto < Number(retencion.monto) && !observacion) {
      dispatch({
        type: "SET_ERROR",
        payload: "La observación es obligatoria cuando no se devuelve el total",
      });
      return;
    }

    dispatch({ type: "SET_CARGA_RESOLVER_RETENCION", payload: true });

    try {
      const resultado = await config.servicios.devolverRetencion({
        id_movimiento: retencion.id_movimiento,
        monto_devuelto: monto,
        observacion,
      });

      if (resultado.code === "RETENCION_DEVUELTA") {
        refrescarCaja();
        dispatch({ type: "RESET_DEVOLUCION_RETENCION" });
        dispatch({ type: "SET_ERROR", payload: null });
      } else {
        dispatch({ type: "SET_ERROR", payload: resultado.message });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error en el servidor al devolver la retención" });
    } finally {
      dispatch({ type: "SET_CARGA_RESOLVER_RETENCION", payload: false });
    }
  };

  const handleJustificarRetencion = async () => {
    const retencion = state.retencionesActivas.find(
      (item) => item.id_movimiento === state.retencionSeleccionada,
    );

    if (!retencion) {
      dispatch({ type: "SET_ERROR", payload: "Seleccioná una retención activa" });
      return;
    }

    const justificacion = state.devolucionRetencion.observacion.trim();

    if (!justificacion) {
      dispatch({ type: "SET_ERROR", payload: "La observación es obligatoria para justificar" });
      return;
    }

    dispatch({ type: "SET_CARGA_RESOLVER_RETENCION", payload: true });

    try {
      const resultado = await config.servicios.justificarRetencion({
        id_movimiento: retencion.id_movimiento,
        justificacion,
      });

      if (resultado.code === "RETENCION_JUSTIFICADA") {
        refrescarCaja();
        dispatch({ type: "RESET_DEVOLUCION_RETENCION" });
        dispatch({ type: "SET_ERROR", payload: null });
      } else {
        dispatch({ type: "SET_ERROR", payload: resultado.message });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error en el servidor al justificar la retención" });
    } finally {
      dispatch({ type: "SET_CARGA_RESOLVER_RETENCION", payload: false });
    }
  };

  return {
    handleAbrirTransferencia,
    handleCerrarTransferencia,
    handleTransferenciaChange,
    handleRegistrarTransferencia,

    handleAbrirRetencion,
    handleCerrarRetencion,
    handleRetencionChange,
    handleRegistrarRetencion,

    handleSeleccionarRetencion,
    handleDevolucionRetencionChange,
    handleDevolverRetencion,
    handleJustificarRetencion,
  };
};
