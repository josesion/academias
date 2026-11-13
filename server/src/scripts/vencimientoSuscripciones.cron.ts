import cron from "node-cron";
import { method as suscripEscuela } from "../data/suscripcion.escuela.data";

let iniciado = false;
const { vencerPlanesEscuelas } = suscripEscuela;
/**
 * Cron que vence automáticamente las inscripciones
 * Se ejecuta una vez por día a las 00:00
 */
export const iniciarCronVencimientoSuscripcion = () => {
  if ( iniciado ) return;
  iniciado = true;  
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🕛 Ejecutando cron de vencimiento de Suscripciones");

      await vencerPlanesEscuelas();

      console.log("✅ Suscripciones vencidas correctamente");
    } catch (error) {
      console.error("❌ Error en cron de vencimiento:", error);
    }
  });
  };