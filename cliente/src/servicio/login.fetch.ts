import { PAGINA  } from "./variables.globales";   
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";

interface UserData {
    id_usuario : number,
    rol: string;
    id_escuela : number,
    usuario : string,
    razon_social : string
    /** Rubro de la escuela (`baile` | `gym`). Spec 047. */
    rubro : string;
    tipo : string;
    estado_suscripcion : string;
}

export interface LoginRequest {
    usuario: string;
    contrasena: string;
}




export const LoginFetch =async ( params: LoginRequest ): Promise<ApiResponse<UserData>>  =>{
    const ruta  = `${PAGINA}api/login`;
    console.log(ruta)

    return await apiFetch(ruta, { 
        method: "POST" ,
        body :{
            "usuario"    : params.usuario,
            "contrasena" : params.contrasena
        },
           credentials: "include",
    });
};

