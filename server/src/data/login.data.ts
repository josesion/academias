
import { tryCatchDatos } from "../utils/tryCatchBD";

import { LoginInputs } from "../squemas/login";
import { TipadoData } from "../tipados/tipado.data";
import { buscarExistenteEntidad } from '../hooks/buscarExistenteEntidad';

/**
 * Consulta la base de datos para verificar la existencia de un usuario.
 * Utiliza la función genérica buscarExistenteEntidad para manejar la respuesta.
 * * @async
 * @function loginData
 * @param {LoginInputs} data - Datos de entrada del login (usuario).
 * @returns {Promise<TipadoData<{id_usuario: number, usuario: string, id_escuela: number, contrasena: string}>>} 
 * Promesa que resuelve con los datos del usuario si existe, o el error correspondiente.
 */
const loginData = async( data : LoginInputs) 
: Promise<TipadoData<{id_usuario: number, 
                      usuario: string, 
                      id_escuela : number
                      contrasena : string  
                    }>>=> {
    const sql : string = `SELECT usuario, id_usuario, id_escuela, contrasena FROM usuarios WHERE usuario = ?`;
    const { usuario } = data ;    
    const valores : unknown[] = [ usuario ]
    return buscarExistenteEntidad({
        slqEntidad : sql,
        entidad    : "usuario",
        valores : valores
    });
};


export const method ={
    loginData : tryCatchDatos( loginData ),
}