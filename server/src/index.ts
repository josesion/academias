import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const puerto = Number(process.env.PORT) || 4000;
const host =  "0.0.0.0";

app.listen(puerto, host, () => {
   console.log(`El servidor se está escuchando en http://${host}:${puerto}`);
}); 





export default app;