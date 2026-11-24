import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

/**
 * Registra una asistencia por escaneo QR.
 *
 * El alumno se identifica por el token JWT (no por PIN).
 * El body envía solo el `id_horario_clase` leído del código QR.
 */
export const registroAsistenciaQR = async (
  idHorarioClase: number,
  signal?: AbortSignal
): Promise<ApiResponse<{ idAsistencia: number; clasesRestantes: number }>> => {
  const ruta = `${PAGINA}api/asistencia_qr`;
  return await apiFetch(ruta, {
    method: "POST",
    body: { id_horario_clase: idHorarioClase },
    signal,
  });
};
