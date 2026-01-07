import cron from "node-cron";
import { method as asistenciaData } from "../data/asistencia.data";

let iniciado = false;

/**
 * Cron que vence automáticamente las inscripciones
 * Se ejecuta una vez por día a las 00:00
 */
export const iniciarCronVencimientoInscripciones = () => {
  if ( iniciado ) return;
  iniciado = true;  
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🕛 Ejecutando cron de vencimiento de inscripciones");

      await asistenciaData.vencerInscripciones();

      console.log("✅ Inscripciones vencidas correctamente");
    } catch (error) {
      console.error("❌ Error en cron de vencimiento:", error);
    }
  });
};

//Formato de cron 
// ┌──────── minuto (0)
// │ ┌────── hora (0)
// │ │ ┌──── día del mes (*)
// │ │ │ ┌── mes (*)
// │ │ │ │ ┌─ día de la semana (*)
// │ │ │ │ │
// 0 0 * * *

// */1 * * * * corre cada minuto
// 0 0 * * *   corre todos los dias a las  00:00
