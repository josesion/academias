import cron from "node-cron";
import { method as logData } from "../data/log.data";

let iniciado = false;

/**
 * Cron que purga los eventos de `logs_eventos` con más de 30 días.
 * Se ejecuta una vez por día a las 03:00 (fuera del horario de los otros crons).
 *
 * La retención vive en la SQL de `log.data.limpiarEventosViejos`; acá solo se
 * decide cuándo corre.
 */
export const iniciarCronPurgaLogs = () => {
  if ( iniciado ) return;
  iniciado = true;
  cron.schedule("0 3 * * *", async () => {
    try {
      console.log("🕛 Ejecutando cron de purga de logs_eventos");

      await logData.limpiarEventosViejos();

      console.log("✅ Logs viejos purgados correctamente");
    } catch (error) {
      console.error("❌ Error en cron de purga de logs:", error);
    }
  });
};
