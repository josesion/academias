import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const puerto = Number(process.env.PORT) || 4000;
const host =  "0.0.0.0";

app.listen(puerto, host, () => {
   console.log(`El servidor se está escuchando en http://${host}:${puerto}`);
}); 





app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    mensaje: "Servidor funcionando",
  });
});


export default app;