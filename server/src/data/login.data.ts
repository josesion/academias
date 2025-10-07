/**
 * @fileoverview Lógica de Acceso a Datos (Data Access Layer) para la Autenticación (Login).
 * @module data/login.data
 * @description Contiene las funciones para interactuar con la base de datos 
 * con el fin de verificar las credenciales de un usuario e iniciar sesión.
 */
import bcrypt from 'bcryptjs';
import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { LoginInputs } from "../squemas/login";
import { TipadoData, DataLogin , UsuarioListado } from "../tipados/tipado.data";
import { select } from "../utils/baseDatos";

/**
 * @function login
 * @description Realiza la verificación de credenciales de usuario. Busca el usuario por 
 * nombre de usuario y luego compara la contraseña proporcionada con la hash almacenada.
 * @async
 * @param {LoginInputs} params - Objeto con las credenciales de login (usuario y contrasena).
 * @returns {Promise<TipadoData<DataLogin>>} Un objeto de respuesta con los datos del usuario logueado.
 * @throws {ClientError} Si el usuario no es encontrado (404, "USER_NOT_FOUND").
 * @throws {ClientError} Si la contraseña es inválida (401, "INVALID_PASSWORD").
 */
const login = async( params : LoginInputs )  : Promise<TipadoData<DataLogin>> => {
    
    // 1. Buscar usuario por nombre de usuario
    const sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    const valores = [params.usuario];
    
    // Ejecuta la consulta (se asume que 'select' devuelve un array de 'UsuarioListado')
    const resultado = await select<UsuarioListado>(sql, valores);
    
    // 2. Verificar existencia del usuario
    if (resultado.length === 0) {
        throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }
    
    // 3. Comparar la contraseña hasheada
    const passwordValida = await bcrypt.compare(params.contrasena, resultado[0].contrasena);
    
    if (!passwordValida) {
        throw new ClientError("Credenciales Invalidas", 401, "INVALID_PASSWORD");
    }
    
    // 4. Retornar datos de sesión exitosa
    return {
        error : false,
        message : "Login exitoso",
        data : {
            usuario: resultado[0].usuario,
            nombre: resultado[0].nombre,
            apellido: resultado[0].apellido,
            estado: resultado[0].estado,
            rol: resultado[0].rol,
            id_escuela : resultado[0].id_escuela
        },
        code : "LOGIN_SUCCESS",

    }
}


/**
 * @constant {Object} method
 * @description Exporta la función de login envuelta en el manejador de errores de la capa de datos (`tryCatchDatos`).
 */
export const method ={
    login: tryCatchDatos(login),
}