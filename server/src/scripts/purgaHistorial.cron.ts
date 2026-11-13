import cron from "node-cron";
import { method as historialData } from "../data/historial.data";

let iniciado = false;

/**
 * Cron que purga las acciones del `historial` con más de `RETENCION_HISTORIAL_DIAS`
 * días (60 por defecto). Se ejecuta una vez por día a las 04:00, fuera del horario
 * de la purga de `logs_eventos` (03:00) para no solapar los dos `DELETE`.
 *
 * La retención vive en la SQL de `historial.data.limpiarHistorialViejo`; acá solo se
 * decide cuándo corre.
 */
export const iniciarCronPurgaHistorial = () => {
  if ( iniciado ) return;
  iniciado = true;
  cron.schedule("0 4 * * *", async () => {
    try {
      console.log("🕛 Ejecutando cron de purga de historial");

      await historialData.limpiarHistorialViejo();

      console.log("✅ Historial antiguo purgado correctamente");
    } catch (error) {
      console.error("❌ Error en cron de purga de historial:", error);
    }
  });
};
