
import { tryCatchDatos } from "../utils/tryCatchBD";

import { LoginInputs } from "../squemas/login";
import { TipadoData } from "../tipados/tipado.data";
import { buscarExistenteEntidad } from '../hooks/buscarExistenteEntidad';

export type RolUsuario = "usuario" | "alumno" | "administrador"; 

export interface UsuarioLogin {
  id_usuario: number;
  usuario: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  id_escuela: number;
  estado: string;
  razon_social : string;
}

/**
 * Busca de forma genérica los datos básicos de un usuario y su escuela asociada
 * por su nombre de usuario, sin validar restricciones de suscripción o planes del SaaS.
 * 
 * @async
 * @function loginDataGenerico
 * @param {LoginInputs} data - Objeto que contiene las credenciales de entrada (usuario).
 * @returns {Promise<TipadoData<UsuarioLogin>>} Retorna una promesa con el resultado de la búsqueda,
 * conteniendo los datos del usuario, su rol, su ID de escuela y la razón social si se encuentra.
 */
const loginDataGenerico = async( data : LoginInputs) 
: Promise<TipadoData<UsuarioLogin>>=> {
    const sql : string = `SELECT 
                            u.id_usuario, 
                            u.usuario, 
                            u.contrasena, 
                            u.nombre, 
                            u.apellido, 
                            u.rol, 
                            u.id_escuela,
                            u.estado,
                            e.razon_social
                        FROM usuarios u
                        INNER JOIN escuelas e ON u.id_escuela = e.id_escuela
                        WHERE u.usuario = ?;`;
    const { usuario } = data ;    
    const valores : unknown[] = [ usuario ]
    return buscarExistenteEntidad({
        slqEntidad : sql,
        entidad    : "usuario",
        valores : valores
    });
};


export interface UsuarioLoginData {
    id_usuario: number;
    usuario: string;
    id_escuela: number;
    contrasena: string;
    rol : RolUsuario;
    razon_social: string;
    estado_suscripcion: string | null;
    fecha_vencimiento: string | null; 
    plan_tipo: string | null;
    plan_descripcion: string | null;
    flayer : number,
    tipo : string;
}

/**
 * Busca los datos completos de un usuario administrador/dueño de escuela,
 * validando estrictamente que la escuela tenga una suscripción activa y vigente,
 * además de traer los detalles del plan SaaS asociado.
 * 
 * @async
 * @function loginDataUsuario
 * @param {LoginInputs} data - Objeto que contiene las credenciales de entrada (usuario).
 * @returns {Promise<TipadoData<UsuarioLoginData>>} Retorna una promesa con los datos extendidos del usuario administrador,
 * incluyendo la razón social, el estado de la suscripción, la fecha de vencimiento y los datos del plan (tipo, descripción y flyers).
 */
const loginDataUsuario = async( data : LoginInputs) 
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
                                p.descripcion AS plan_descripcion,
                                p.cant_flyers AS flayer
                            FROM usuarios u 
                            INNER JOIN escuelas e ON u.id_escuela = e.id_escuela 
                            LEFT JOIN suscripciones_escuelas s ON e.id_escuela = s.id_escuela 
                                AND s.estado = 'activo' -- Traemos la suscripción activa (incluso si ya venció la fecha)
                            LEFT JOIN planes_saas p ON s.id_plan_saas = p.id_plan
                            WHERE u.usuario = ?;`;
    const { usuario } = data ;    
    const valores : unknown[] = [ usuario ]
    return buscarExistenteEntidad({
        slqEntidad : sql,
        entidad    : "usuario",
        valores : valores
    });
};



export const method ={
    loginDataGenerico : tryCatchDatos( loginDataGenerico ),
    loginDataUsuario  : tryCatchDatos( loginDataUsuario)
}