import { useAsistenciaRapidaLogica } from "../hooks/asistenciaRapida";

// ── Sección de servicios ────────────────────────────────────────────
import {
  asistenciaHorarios,
  infoAlumno,
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
export const useAsistenciaRapidaSet = (abierto: boolean) => {
  const config = {
    servicios: {
      asistenciaHorarios,
      infoAlumno,
      registroAsistenciaManual,
      listarPlantillas,
      crearPlantilla,
      borrarPlantilla,
      agregarAlumnosPlantilla,
      quitarAlumnoPlantilla,
    },
  };

  return useAsistenciaRapidaLogica(config, abierto);
};
