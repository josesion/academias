import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataLogin  } from "../data/login.data";
import { LoginInputs, loginSchema } from "../squemas/login";
import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/jwt";
import { TipadoData } from "../tipados/tipado.data";

interface LoginDataResult {
    id_usuario : number,
    id_escuela : number,
    usuario    : string,
    tokenCadena : string,
    rol : "usuario" | "admin" 
};

/**
 * Servicio de autenticación: Valida esquema, busca usuario, verifica password y genera JWT.
 * * @async
 * @function loginUsuario
 * @param {LoginInputs} data - Objeto con las credenciales del usuario (usuario y contrasena).
 * @returns {Promise<TipadoData<LoginDataResult>>} Objeto estandarizado con:
 * - error: boolean
 * - message: descripción del resultado
 * - data: (id_usuario, id_escuela, usuario, tokenCadena) si el login es exitoso.
 * - code: "USUARIO_EXISTE" | "VERIFICAR_USUARIO" | "USUARIO_NO_EXISTE" | "ERROR_LOGIN"
 * * @description
 * 1. Valida los datos con loginSchema (Zod).
 * 2. Consulta la capa de datos (dataLogin).
 * 3. Compara hashes de contraseña con bcrypt.
 * 4. Genera el token de sesión con el ID numérico.
 */
const loginUsuario =  async ( data : LoginInputs) 
: Promise<TipadoData<LoginDataResult>>=> {
    const loginData : LoginInputs = loginSchema.parse( data );
    const loginResult = await dataLogin.loginData( loginData );
   
    if ( loginResult.code === "USUARIO_EXISTE" && loginResult.data){
        const passwordValida = await bcrypt.compare(data.contrasena, loginResult.data.contrasena);
        const token = generateToken({ id: loginResult.data.id_usuario });
        if (passwordValida){
            return{
                error: false,
                message : "El usuario existe en el sistema",
                data : {
                    id_escuela : loginResult.data.id_escuela,
                    id_usuario :  loginResult.data.id_usuario,
                    usuario    :  loginResult.data.usuario,
                    rol        : loginResult.data.rol, 
                    tokenCadena : token
                },
                code : "USUARIO_EXISTE"
            };
        }else{
            return{
                error : true,
                message : "Verifcar los datos del usuario",
                code   : "VERIFICAR_USUARIO"
            };
        };    
    };

    if ( loginResult.code === "USUARIO_NO_EXISTE"){
        return {
            error : true,
            message : "El usuario no existe en el sistema",
            code : "USUARIO_NO_EXISTE"
        };
    }

    return{
        error : true,
        message :  "Error al intentar loguearse en el sistema",
        code : "ERROR_LOGIN"
    };    
};

export const method = {
    loginServicio : tryCatchDatos( loginUsuario ),
};