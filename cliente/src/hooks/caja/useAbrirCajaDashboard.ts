import { useState, useEffect, useCallback } from "react";
import { idCajaFuntion } from "../../utils/idCaja";
import { peticionComunicacion } from "../../utils/canalComunicacion";
import { abrirCaja, listadoTipoCuentas } from "../../servicio/caja.fetch";
import type { DetalleApertura, ListadoTipoCuentas } from "../../tipadosTs/caja.typado";

/**
 * Hook ligero para abrir caja desde el dashboard sin usar el reducer completo de caja.
 *
 * Evita crear una segunda instancia de `cajaReducer` que compita con la página `CajaArqueo`.
 * Hace fetch directo a los servicios y notifica al dashboard para refrescar métricas
 * mediante `peticionComunicacion`.
 */
export const useAbrirCajaDashboard = () => {
  const [cuentasActivas, setCuentasActivas] = useState<ListadoTipoCuentas[]>([]);
  const [aperturaDetalle, setAperturaDetalle] = useState<DetalleApertura[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cajaAbierta, setCajaAbierta] = useState(false);

  /**
   * Al montar, determina si ya existe una caja abierta consultando el servidor.
   */
  useEffect(() => {
    idCajaFuntion().then((id) => {
      setCajaAbierta(id !== null);
    });
  }, []);

  /**
   * Carga las cuentas habilitadas desde el servidor.
   * Se llama al abrir el modal de apertura.
   */
  const cargarCuentas = useCallback(async () => {
    setError(null);
    try {
      const result = await listadoTipoCuentas({ estado: "activos" });
      if (result.code === "LISTA_TIPOS_CUENTAS_OK" && "data" in result) {
        const cuentas = result.data as ListadoTipoCuentas[];
        setCuentasActivas(cuentas);
        // Inicializar el detalle con monto vacío para cada cuenta
        setAperturaDetalle(
          cuentas.map((c) => ({
            id_cuenta: c.id_cuenta,
            nombre_cuenta: c.nombre_cuenta,
            monto: "",
          }))
        );
      }
    } catch {
      setError("No se pudieron cargar las cuentas. Intenta de nuevo.");
    }
  }, []);

  /**
   * Actualiza el monto de una cuenta en `aperturaDetalle`.
   * Mismo patrón que `cachearMontoIniciales` en `useCajaBase`.
   */
  const onChangeMonto = useCallback(
    (id_cuenta: number, nombre: string, valor: string) => {
      const montoFinal = valor === "" ? "" : Number(valor);
      if (valor !== "" && isNaN(Number(valor))) return;

      setAperturaDetalle((prev) => {
        const existe = prev.find((d) => d.id_cuenta === id_cuenta);
        if (existe) {
          return prev.map((d) =>
            d.id_cuenta === id_cuenta ? { ...d, monto: montoFinal } : d
          );
        }
        return [...prev, { id_cuenta, nombre_cuenta: nombre, monto: montoFinal }];
      });
    },
    []
  );

  /**
   * Dispara un dispatch nulo para cumplir con la firma de `peticionComunicacion`.
   * Este hook no tiene reducer, así que el error de canal no afecta el estado local.
   */
  const dispatchNulo: React.Dispatch<any> = () => {};

  /**
   * Valida que todos los montos estén completados y llama a `abrirCaja`.
   * On éxito: actualiza `cajaAbierta` y notifica al dashboard para refrescar métricas e historial.
   */
  const onAbrirCaja = useCallback(async () => {
    setError(null);

    // Validar que todos los montos estén completados
    const incompletos = aperturaDetalle.filter((d) => d.monto === "" || d.monto === null);
    if (incompletos.length > 0) {
      setError("Complete el monto inicial de todas las cuentas antes de abrir.");
      return;
    }

    setCargando(true);
    try {
      // Limpiar montos vacíos a 0
      const detalleLimpiado = aperturaDetalle.map((item) => ({
        ...item,
        monto: item.monto === "" ? 0 : Number(item.monto),
      }));

      const result = await abrirCaja({ estado: "abierta", detalle: detalleLimpiado });

      if (result.code === "CAJA_ABIERTA_OK") {
        setCajaAbierta(true);

        // Refresca el panel principal para recalcular métricas y tarjetas afectadas
        peticionComunicacion({
          nombreCanal: "canal_actualizar_metricas_principal",
          mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
          dispatchError: dispatchNulo,
          error: "SET_ERROR_METRICAS_TARJETAS",
        });

        // Actualiza los registros del historial para reflejar la nueva actividad generada
        peticionComunicacion({
          nombreCanal: "canal_actualizar_metricas_historial",
          mensaje: "ACTUALIZAR_HISTORIAL",
          dispatchError: dispatchNulo,
          error: "SET_ERROR_HISTORIAL",
        });
      } else {
        setError(result.message || "Error al abrir la caja.");
      }
    } catch {
      setError("No se pudo abrir la caja. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }, [aperturaDetalle, dispatchNulo]);

  return {
    cuentasActivas,
    aperturaDetalle,
    cargando,
    error,
    cajaAbierta,
    cargarCuentas,
    onChangeMonto,
    onAbrirCaja,
    setError,
  };
};
