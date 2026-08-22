import dotenv from "dotenv";

dotenv.config();

export const PAGINA = import.meta.env.VITE_API_URL || process.env.PAGI;
//export const PAGINA = "http://localhost:4000/";

