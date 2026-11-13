import { useAsistenciaRapidaLogica } from "../hooks/asistenciaRapida";

// ── Sección de servicios ────────────────────────────────────────────
import {
  asistenciaHorarios,
  infoAlumno,
  buscarAlumnoAsistencia,
  registroAsistenciaManual,
  listarPlantillas,
  crearPlantilla,
  borrarPlantilla,
  agregarAlumnosPlantilla,
  quitarAlumnoPlantilla,
} from "../servicio/asistencia.fetch";

/**
 * Punto de entrada de la lógica de la asistencia rápida manual (spec 043).
 *
 * Sólo cablea los servicios: la lógica vive en `useAsistenciaRapidaLogica`
 * y el estado en `asistenciaRapidaReducer`.
 *
 * @param {boolean} abierto - Si el modal está abierto.
 * @returns {object} Estado y handlers del modal.
 */
export const useAsistenciaRapidaSet = (
  abierto: boolean,
  onAsistenciaRegistrada?: () => void
) => {
  const config = {
    servicios: {
      asistenciaHorarios,
      infoAlumno,
      buscarAlumno: buscarAlumnoAsistencia,
      registroAsistenciaManual,
      listarPlantillas,
      crearPlantilla,
      borrarPlantilla,
      agregarAlumnosPlantilla,
      quitarAlumnoPlantilla,
    },
  };

  return useAsistenciaRapidaLogica(config, abierto, onAsistenciaRegistrada);
};
