import app from "./app";
import dotenv from "dotenv";
import { method as asistenciaData } from "./data/asistencia.data";
import { method as dataSuscripcion } from "./data/suscripcion.escuela.data";
import { iniciarCronVencimientoInscripciones } from "./scripts/vencerInscripciones.cron";
import { iniciarCronVencimientoSuscripcion } from "./scripts/vencimientoSuscripciones.cron";

dotenv.config();

const puerto = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

app.listen(puerto, host, () => {
   console.log(`El servidor se está escuchando en http://${host}:${puerto}`);

   // Iniciamos los crons y las tareas de base de datos de forma segura una vez que el server arrancó
   iniciarCronVencimientoInscripciones();
   iniciarCronVencimientoSuscripcion();
   
   asistenciaData.vencerInscripciones().catch(err => console.log("Error al vencer inscripciones:", err));
   dataSuscripcion.vencerPlanesEscuelas().catch(err => console.log("Error al vencer planes:", err));
});

export default app;