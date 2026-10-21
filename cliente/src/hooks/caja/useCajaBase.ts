import { useEffect, useReducer } from "react";
import { peticionComunicacion } from "../../utils/canalComunicacion";
import { initialStateMetricas, metricasReducer } from "../../reducers/metricasReducer";
// utils -------------------------------------------------------------
import { idCajaFuntion } from "../../utils/idCaja";
import { cajaReducer, initialState } from "../../reducers/cajaReducers";

import type { JsonDataCierre, DataCierreCaja } from "../../tipadosTs/caja.typado";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


interface CajaBaseConfig {

  usuario: string;

  servicios: {
    abrirCaja: ServicioCrud;
    cerrarCaja: ServicioCrud;
    obtenerIdCaja: ServicioCrud;
  };
}

export const useCajaBase = (config: CajaBaseConfig) => {

  const [stateMetrica, dispatchMetricas] = useReducer(metricasReducer, initialStateMetricas());
  const [state, dispatch] = useReducer(cajaReducer, initialState({
    usuario: config.usuario,
  }));


// ──────────────────────────────────────────────────────────────
// Handle para Cachear los monto iniciales
// ────────────────────────────────────────────────────────────── 

// --- Capturamos el monto de las cuentas para determinar el saldo inical de cada una
const cachearMontoIniciales = (id_cuenta: number, nombre: string, valor: string) => {

  const montoFinal = valor === "" ? "" : Number(valor);
  const idCuenta = id_cuenta;

  if (valor !== "" && isNaN(Number(valor))) return;

  dispatch({ type: "UPDATE_MONTO_APERTURA_DETALLE", payload: { nombreCuenta: nombre, valorCuenta: montoFinal } });
};


// ──────────────────────────────────────────────────────────────
// Hanldes para manejar los estados de caja (abrir modales SIN loading global)
// ────────────────────────────────────────────────────────────── 

const handleEstadosCaja = () => {
  if (state.dataCaja.id_caja === null) {
    dispatch({ type: "ABRIR_MODAL", payload: "apertura" });
  } else {
    dispatch({ type: "ABRIR_MODAL", payload: "cierre" });
  }
};

// ──────────────────────────────────────────────────────────────
//  Handle para Abrir caja (loading real en la mutación)
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async () => {
  try {
    dispatch({ type: "CARGA_MOVIEMENTO_APERTURA", payload: true });

    // Si es q un monto es "" lo limpiamos o lo colocamos en  0
    const detalleLimpiado = state.aperturaDetalle?.map((item) => {
      const montoRaw = item.monto as unknown;
      return {
        ...item,
        monto: montoRaw === "" ? 0 : Number(montoRaw)
      };
    });

    const data = {
      estado: "abierta",
      detalle: detalleLimpiado // a modificar mas a delante
    };

    const servicioApiFetch = config.servicios.abrirCaja;
    const aperturaCajaResult = await servicioApiFetch(data);

    if (aperturaCajaResult.code === "CAJA_ABIERTA_OK") {
      // Refresca el panel principal para recalcular métricas y tarjetas afectadas
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_principal",
        mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
        dispatchError: dispatchMetricas,
        error: 'SET_ERROR_METRICAS_TARJETAS',
      });

      // Actualiza los registros del historial para reflejar la nueva actividad generada
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_historial",
        mensaje: "ACTUALIZAR_HISTORIAL",
        dispatchError: dispatchMetricas,
        error: 'SET_ERROR_HISTORIAL'
      });

      dispatch({ type: "CERRAR_MODALES" });
      dispatch({ type: "ABRIR_MODAL_ANIMACION_APERTURA" });

      dispatch({
        type: "SET_CAJA_ACTIVA",
        payload: {
          id_caja: aperturaCajaResult.data.id_caja,
          estado: "abierta"
        }
      });

      dispatch({ type: "ACTUALIZAR_METODO_PAGO" });

      setTimeout(() => {
        dispatch({ type: "CERRAR_MODAL_ANIMACION_APERTURA" });
      }, 2000);

    } else {
      dispatch({
        type: "SET_ERROR",
        payload: aperturaCajaResult.errorsDetails?.[0].message || "Error al abrir caja"
      });
    }

  } catch (error) {
    dispatch({
      type: "SET_ERROR",
      payload: "Error servidor, al abrir caja"
    });
  } finally {
    dispatch({ type: "CARGA_MOVIEMENTO_APERTURA", payload: false });
  }
};


// ──────────────────────────────────────────────────────────────
//  Handle para Cerrar caja (loading real en la mutación)
// ────────────────────────────────────────────────────────────── 


/**
 * Cierra la caja abierta: arma el payload de cierre (totales + `arqueo_detalle`)
 * y lo manda al servicio `cerrarCaja`.
 *
 * El `arqueo_detalle` se arma desde `state.metricasCuentasCierre` (el conteo
 * real del cajero) —ver el bloque de `dataDetalleCuentas`— para que
 * `Σ(real − sistema)` coincida con `diferencia_total` (spec 042, **CA-13**).
 *
 * No modifica la UI del arqueo ni el cálculo de `monto_final_real` /
 * `diferencia_total`.
 */
const handleCerrarCaja = async () => {

  if (!state.dataCaja?.id_caja) {
    dispatch({
      type: "SET_ERROR",
      payload: "Error: No se encontró un ID de caja activo."
    });
    return;
  }


  let dataDetalleCuentas: JsonDataCierre[] = [];

  /**
   * Arma el `arqueo_detalle` que se persiste al cerrar la caja.
   *
   * Se toma de `state.metricasCuentasCierre` (el `MetodosPago[]` que el
   * reducer mantiene con `INICIALIZAR_METODO_PAGO` + `UPDATE_MONTO_REAL_CIERRE`),
   * porque ese es el único lado donde vive **el conteo real que escribió el
   * cajero** (`monto_real`).
   *
   * Antes se armaba desde `state.metricasTipoCuentas` con
   * `real = movimiento_sesion` (el flujo de la sesión **sin** el saldo inicial)
   * contra `sistema = saldo_final_cuenta` (el saldo final **con** el saldo
   * inicial): por eso `Σ(real − sistema)` no coincidía con `diferencia_total`.
   *
   * Con este fix (spec 042): `sistema` sigue siendo `saldo_final_cuenta` (el
   * mismo valor de antes) y `real` es el conteo del cajero ⇒
   * `Σ(real − sistema) = diferencia_total` exactamente (**CA-13**).
   */
  if (state.metricasCuentasCierre && state.metricasCuentasCierre.length > 0) {

    dataDetalleCuentas = state.metricasCuentasCierre.map((item) => {
      return {
        id_cuenta: Number(item.id_cuenta),      // Aseguramos que sea number
        nombre_cuenta: item.nombre_cuenta,
        sistema: Number(item.monto_sistema),    // Lo que el sistema dice que hay (saldo final de la cuenta)
        real: Number(item.monto_real) || 0,     // El conteo real que escribió el cajero
      };
    });
  };

  let dataCierreCaja: DataCierreCaja | null = null;

  if (!dataDetalleCuentas || dataDetalleCuentas.length === 0) {
    dispatch({ type: "SET_ERROR", payload: "No se pudo generar el detalle del arqueo" })
    return;
  }

  if (state.panelPrincipal && state.dataCaja.id_caja) {

    dataCierreCaja = {
      id_caja: state.dataCaja.id_caja,

      monto_final_real: Number(state.montoRealFinal),
      monto_sistema: state.panelPrincipal[0].balance_neto ?? 0,
      diferencia_total: Number(state.montoRealFinal) - state.panelPrincipal[0].balance_neto,
      arqueo_detalle: dataDetalleCuentas,
      observaciones_cierre: state.observaciones
    };
  };

  try {
    dispatch({ type: "CARGA_MOVIEMENTO_CIERRE", payload: true });

    const servicioApiFetch = config.servicios.cerrarCaja;
    const cierreCajaResult = await servicioApiFetch(dataCierreCaja);

    if (cierreCajaResult.code === "CIERRE_CAJA_OK") {

      // Refresca el panel principal para recalcular métricas y tarjetas afectadas
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_principal",
        mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
        dispatchError: dispatchMetricas,
        error: 'SET_ERROR_METRICAS_TARJETAS',
      });

      // Actualiza los registros del historial para reflejar la nueva actividad generada
      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_historial",
        mensaje: "ACTUALIZAR_HISTORIAL",
        dispatchError: dispatchMetricas,
        error: 'SET_ERROR_HISTORIAL'
      });

      dispatch({ type: "ABRIR_MODAL_ANIMACION" });
      dispatch({ type: "SET_CAJA_ACTIVA", payload: { id_caja: null, estado: "cerrada" } });
      dispatch({ type: "CERRAR_MODALES" });

      peticionComunicacion({
        nombreCanal: "canal_actualizar_metricas_cierre",
        mensaje: "ACTUALIZAR_CIERRE",
        dispatchError: dispatchMetricas,
        error: 'SET_ERROR_METRICAS_CIERRE',
      });

      setTimeout(() => {
        dispatch({ type: "CERRAR_MODAL_ANIMACION" });
        dispatch({ type: "RESET_MONTO_APERTURA_DETALLE", payload: state.aperturaDetalle });
        dispatch({ type: "FORMATEAR_MOV_EXTRAORDINARIOS" });
        dispatch({ type: "RESET_MONTO_CUENTAS_CIERRE", payload: state.metricasCuentasCierre });
      }, 2000);
    };
    if (cierreCajaResult.code === "NO_HAY_CAJA_ABIERTA") {
      return dispatch({ type: "SET_ERROR", payload: "No existe caja abierta" });
    }

  } catch (error) {
    dispatch({ type: "SET_ERROR", payload: "Error en el servidor" });
  } finally {
    dispatch({ type: "CARGA_MOVIEMENTO_CIERRE", payload: false });
  };
};

// ──────────────────────────────────────────────────────────────
// FUNCION para obtener el estado de caja cuando se renderiza caja , fallaba y esto es un parche
// ────────────────────────────────────────────────────────────── 

const sincronizarEstadoCaja = async () => {
  // if (!config?.id_escuela) return;
  try {
    const idCajaResult = await idCajaFuntion();
    if (idCajaResult) {
      dispatch({ type: "SET_CAJA_ACTIVA", payload: { id_caja: idCajaResult, estado: "abierta" } });
      // ... tus otros dispatch de éxito
    } else {
      dispatch({ type: "SET_CAJA_ACTIVA", payload: { id_caja: null, estado: "cerrada" } });
    }
  } catch (error) {
    console.error(error);
  }
};


useEffect(() => {
  sincronizarEstadoCaja();
}, []); // colocar un resfrescador 


// ──────────────────────────────────────────────────────────────
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect(() => {
  const idCaja = async () => {

    const idCajaResult = await idCajaFuntion();

    if (idCajaResult) {

      dispatch({
        type: "SET_CAJA_ACTIVA",
        payload: {
          id_caja: idCajaResult,
          estado: "abierta"
        }
      });

      dispatch({
        type: 'SET_ERROR',
        payload: null
      });

      dispatch({ type: "UPDATE_MOVIMIENTO_EXTRA", payload: { campo: "id_caja", valor: idCajaResult } });

    } else {
      dispatch({
        type: "SET_CAJA_ACTIVA",
        payload: {
          id_caja: null,
          estado: "cerrada"
        }
      });
    };
  };
  idCaja();
}, []);


  return {
    state,
    stateMetrica,
    dispatch,
    dispatchMetricas,

    handleAbrirCaja,
    handleCerrarCaja,
    handleEstadosCaja,
    cachearMontoIniciales,
    sincronizarEstadoCaja,
  };

};