import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerIdCaja } from "../../servicio/caja.fetch";

/**
 * Hook ligero para consultar el estado de la caja en el dashboard.
 *
 * Determina si la caja está abierta o cerrada llamando a `obtenerIdCaja`
 * al montar el componente. Se usa solo para mostrar el botón dinámico
 * "Abrir Caja" / "Cerrar Caja" en el encabezado del dashboard.
 *
 * @returns Estado de la caja y función para navegar a la página de caja.
 */
export function useEstadoCajaDashboard() {
  const [estadoCaja, setEstadoCaja] = useState<"abierta" | "cerrada" | null>(null);
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEstado = useCallback(async () => {
    setCarga(true);
    setError(null);

    try {
      const respuesta = await obtenerIdCaja();
      if ("data" in respuesta && respuesta.data != null) {
        const idCaja = respuesta.data.id_caja;
        setEstadoCaja(idCaja != null ? "abierta" : "cerrada");
      } else {
        setEstadoCaja("cerrada");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al consultar el estado de la caja");
      setEstadoCaja("cerrada");
    } finally {
      setCarga(false);
    }
  }, []);

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);

  const navigate = useNavigate();

  const navegarACaja = useCallback(() => {
    navigate("/caja");
  }, [navigate]);

  return {
    estadoCaja,
    carga,
    error,
    navegarACaja,
  };
}
