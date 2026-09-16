
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
export interface UsuarioLoginData {
    id_usuario: number;
    usuario: string;
    id_escuela: number;
    contrasena: string;
    rol : "usuario" | "admin" , // O podés dejarlo como "usuario" | "admin" según prefieras
    razon_social: string;
    estado_suscripcion: string | null;
    fecha_vencimiento: string | null; // O Date, dependiendo de cómo lo devuelva tu driver de DB
    plan_tipo: string | null;
    plan_descripcion: string | null;
}

const loginData = async( data : LoginInputs) 
: Promise<TipadoData<UsuarioLoginData>>=> {
    const sql : string = `SELECT 
                            u.usuario,
                            u.id_usuario,
                            u.id_escuela,
                            u.contrasena,
                            u.rol,
                            e.razon_social,
                            s.estado AS estado_suscripcion,
                            s.fecha_vencimiento,
                            p.tipo AS plan_tipo,
                            p.descripcion AS plan_descripcion
                        FROM usuarios u 
                        INNER JOIN escuelas e ON u.id_escuela = e.id_escuela 
                        INNER JOIN suscripciones_escuelas s ON e.id_escuela = s.id_escuela 
                            AND s.estado = 'activo' 
                            AND s.fecha_vencimiento >= CURDATE()
                        INNER JOIN planes_saas p ON s.id_plan_saas = p.id_plan
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