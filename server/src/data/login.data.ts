
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
                      contrasena : string,
                      rol : "usuario" | "admin" ,
                      razon_social : string 
                    }>>=> {
    const sql : string = `select 
                            u.usuario,
                            u.id_usuario,
                            u.id_escuela,
                            u.contrasena,
                            u.rol,
                            e.razon_social
                        from
                            usuarios u 
                            inner join escuelas e ON u.id_escuela = e.id_escuela 
                        where
                            u.usuario = ?;`;
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