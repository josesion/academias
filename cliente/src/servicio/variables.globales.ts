
const BASE_API_RAW = (import.meta.env.VITE_API_URL ?? "http://192.168.0.22:4000").trim();

export const PAGINA = `${BASE_API_RAW.replace(/\/+$/, "").replace(/\/api$/, "")}/`;

// Ejemplo de valores válidos:
// - https://tu-api.onrender.com
// - https://tu-api.onrender.com/api
// - http://192.168.0.22:4000

