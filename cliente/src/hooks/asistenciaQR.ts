import { useState, useCallback } from "react";
import { registroAsistenciaQR } from "../servicio/asistenciaQR.fetch";

/**
 * Hook para registrar asistencia por escaneo QR.
 *
 * El alumno escanea un QR con `id_horario_clase` y el hook envía la petición
 * al backend usando el token JWT del alumno autenticado.
 */
export const useAsistenciaQR = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        setError(resultado.message || "Error al registrar asistencia");
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
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
