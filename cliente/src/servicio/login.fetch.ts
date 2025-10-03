import { PAGINA  } from "./variables.globales";   
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";

interface UserData {
    usuario: string; 
    nombre: string;
    apellido: string;
    estado: string;
    rol: string;
    id_escuela : number
}

export interface LoginRequest {
    usuario: string;
    contrasena: string;
}




export const LoginFetch =async ( params: LoginRequest ): Promise<ApiResponse<UserData>>  =>{
    const ruta  = `${PAGINA}api/login`;
    return await apiFetch(ruta, { 
        method: "POST" ,
        body :{
            "usuario"    : params.usuario,
            "contrasena" : params.contrasena
        }
    });
};

