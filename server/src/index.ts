import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const puerto = process.env.PORT || 3000;


app.listen(puerto, () => {
    console.log(`El servidor se está escuchando desde del puerto ${puerto}`);
}); 