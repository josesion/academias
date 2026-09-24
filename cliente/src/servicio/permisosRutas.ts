import { PAGINA  } from "./variables.globales";   
import  { apiFetch ,type ApiResponse  } from "../utils/apiFetch";


interface ValidarToken {
    usuario: string  ;
    rol : string,
    razon_social: string;
    tipo : string;
    estado_suscripcion : string;
}

export const VerificarPermisos = async() : Promise<ApiResponse<ValidarToken>> =>{
    const ruta = `${PAGINA}api/verificar`;
    return apiFetch<ValidarToken>(ruta, { method: "GET" })
}