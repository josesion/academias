import { PAGINA  } from "./variables.globales";   
import  { apiFetch ,type ApiResponse  } from "../utils/apiFetch";


interface ValidarToken {
    usuario: string | null ;
}

export const VerificarPermisos = async() : Promise<ApiResponse<ValidarToken>> =>{
    const ruta = `${PAGINA}api/verificar`;
    return apiFetch<ValidarToken>(ruta, { method: "GET" })
}