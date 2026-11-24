import { useState, useCallback } from "react";
import { registroAsistenciaQR } from "../servicio/asistenciaQR.fetch";

type ErrorAsistenciaQR = {
  mensaje: string;
  codigo?: string;
} | null;

/**
 * Hook para registrar asistencia por escaneo QR.
 *
 * El alumno escanea un QR con `id_horario_clase` y el hook envía la petición
 * al backend usando el token JWT del alumno autenticado.
 */
export const useAsistenciaQR = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<ErrorAsistenciaQR>(null);
  const [exito, setExito] = useState(false);

  const registrarAsistencia = useCallback(async (idHorarioClase: number) => {
    setCargando(true);
    setError(null);
    setExito(false);

    try {
      const resultado = await registroAsistenciaQR(idHorarioClase);

      if (resultado.code === "ASISTENCIA_OK") {
        setExito(true);
        setTimeout(() => setExito(false), 3000);
      } else {
        const mensaje = resultado.code === "TRANSACCION_FALLIDA"
          ? resultado.message || "No se pudo completar el registro de asistencia."
          : resultado.message || "Error al registrar asistencia";
        setError({ mensaje, codigo: resultado.code });
      }
    } catch (err: unknown) {
      setError({ mensaje: err instanceof Error ? err.message : "Error de conexión" });
    } finally {
      setCargando(false);
    }
  }, []);

  const resetear = useCallback(() => {
    setError(null);
    setExito(false);
  }, []);

  return {
    cargando,
    error,
    exito,
    registrarAsistencia,
    resetear,
  };
};
