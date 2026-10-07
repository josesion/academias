import { PAGINA  } from "./variables.globales";   
import  { apiFetch ,type ApiResponse  } from "../utils/apiFetch";


interface ValidarToken {
    usuario: string  ;
    rol : string,
    razon_social: string;
    tipo : string;
    /** `null` cuando la escuela todavía no tiene ninguna suscripción en la BD */
    estado_suscripcion : string | null;
}

export const VerificarPermisos = async() : Promise<ApiResponse<ValidarToken>> =>{
    const ruta = `${PAGINA}api/verificar`;
    return apiFetch<ValidarToken>(ruta, { method: "GET" })
}