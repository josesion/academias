import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataLogin  } from "../data/login.data";
import { LoginInputs, loginSchema } from "../squemas/login";
import { method as servicioHistorial} from "../Servicio/historial.servicio";

import bcrypt from 'bcryptjs';
import { generateToken } from "../utils/jwt";
import { TipadoData } from "../tipados/tipado.data";
import { type HistorialInputs } from "../squemas/historial";

interface LoginDataResult {
    id_usuario : number,
    id_escuela : number,
    usuario    : string,
    tokenCadena : string,
    rol : "usuario" | "administrador" | "alumno",
    razon_social : string ;
    tipo : string;
    estado_suscripcion : string
};



 /**
 * Procesa el inicio de sesión de un usuario (alumno o administrador/dueño de escuela),
 * validando credenciales, verificando roles y aplicando restricciones de planes SaaS si corresponde.
 * 
 * @async
 * @function loginUsuario
 * @param {LoginInputs} data - Objeto con las credenciales ingresadas por el usuario (usuario y contraseña).
 * @returns {Promise<TipadoData<LoginDataResult>>} Retorna un objeto con el resultado de la operación,
 * indicando si hubo error, un mensaje descriptivo, un código de estado interno y los datos de sesión (incluyendo el token JWT).
 * 
 * @throws {ZodError} Si los datos de entrada no cumplen con la validación del esquema `loginSchema`.
 * @throws {Error} Si ocurre un error inesperado en la base de datos o en los servicios externos.
 */
   
const loginUsuario =  async ( data : LoginInputs) 
: Promise<TipadoData<LoginDataResult>>=> {

    
    let token ;
    const loginData : LoginInputs = loginSchema.parse( data );
    const loginResult = await dataLogin.loginDataGenerico( loginData );
    
    if ( loginResult.code === "USUARIO_EXISTE" && loginResult.data){

        const passwordValida = await bcrypt.compare(data.contrasena, loginResult.data.contrasena);

        if( !passwordValida ){
            return{
                error : true,
                message : "Verifcar los datos del usuario",
                code   : "VERIFICAR_USUARIO"
            };
        };


        if ( loginResult.data.rol === "alumno" || loginResult.data.rol === "administrador" ){

           const tipoResult =  loginResult.data.rol === "alumno" ? "alumno" : "administrador" 

            const tokenData = {
                    id: loginResult.data.id_usuario,
                    rol: loginResult.data.rol,
                    id_escuela: loginResult.data.id_escuela,
                    // El login viaja en el token: lo usa `permisos.validarPermiso`
                    // para completar `req.usuario` y desde ahí los errores se
                    // guardan en `logs_eventos` con el nombre real (spec 011)
                    usuario : loginResult.data.usuario,
                    tipo : tipoResult ,
                    flayer : 0,
            };

             token = generateToken(tokenData);

             return{
                error: false,
                message : "El usuario existe en el sistema",
                data : {
                    id_escuela : loginResult.data.id_escuela,
                    id_usuario :  loginResult.data.id_usuario,
                    usuario    :  loginResult.data.usuario,
                    rol        : loginResult.data.rol, 
                    razon_social : loginResult.data.razon_social,
                    tipo : "basico",
                    estado_suscripcion : "Sin fecha",
                    tokenCadena : token 
                },
                code : "USUARIO_EXISTE"
            };              

        };

        if (loginResult.data.rol === "usuario"){

                const usuarioLogin = await dataLogin.loginDataUsuario(loginData);
        
                if ( usuarioLogin.code === "USUARIO_EXISTE" && usuarioLogin.data  ){
                  
                            const tokenData = {
                                id: loginResult.data.id_usuario,
                                rol: loginResult.data.rol,
                                id_escuela: loginResult.data.id_escuela,
                                usuario : loginResult.data.usuario,
                                tipo : usuarioLogin.data.plan_tipo,
                                flayer : usuarioLogin.data.flayer ,
                                estado_suscripcion : usuarioLogin.data.estado_suscripcion               
                            };
                        
                            token = generateToken(tokenData);


                            if ( usuarioLogin.data.rol === "usuario"){
                            // Este filtro es para q solamente ingrese el historial del usuario

                        
                            const dataHistorial : HistorialInputs = {
                                id_escuela :  loginResult.data.id_escuela ,
                                id_usuario :  loginResult.data.id_usuario,
                                modulo : "USUARIOS",
                                accion : "LOGIN",
                                id_registro: loginResult.data.id_usuario,
                                descripcion: `${loginResult.data.usuario} ingreso al sistema`,
                                datos: {
                                    "usuario":  loginResult.data.usuario,
                                    "id_escuela" : loginResult.data.id_escuela,
                                    "estado_suscripcion" : usuarioLogin.data.estado_suscripcion
                                }
                            };    
                            
                            const historial = await  servicioHistorial.postHistorialServicio( dataHistorial);

                            if ( historial.code !== "HISTORIAL_OK" ) {
                                    console.error("Error registrando historial de login:", historial.message);
                            };


                          
                            return{
                                error: false,
                                message : "El usuario existe en el sistema",
                                data : {
                                    id_escuela : loginResult.data.id_escuela,
                                    id_usuario :  loginResult.data.id_usuario,
                                    usuario    :  loginResult.data.usuario,
                                    rol        : loginResult.data.rol, 
                                    razon_social : usuarioLogin.data.razon_social,
                                    tipo : usuarioLogin.data.tipo,
                                    estado_suscripcion : usuarioLogin.data.estado_suscripcion || "Sin fecha", 
                                    tokenCadena : token 
                                },
                                code : "USUARIO_EXISTE"
                            }; 
                    };
                };

                if ( usuarioLogin.code === "USUARIO_NO_EXISTE" ){
                
                    return {
                        error : true,
                        message : "El usuario no existe en el sistema o esta vencido su plan.",
                        code : "USUARIO_NO_EXISTE"
                    };
                };
        };
    };


    if ( loginResult.code === "USUARIO_NO_EXISTE"){
        return {
            error : true,
            message : "Verifique sos datos.",
            code : "USUARIO_NO_EXISTE"
        };
    }

    return{
        error : true,
        message :  "Error al intentar loguearse en el sistema",
        code : "ERROR_SERVIDOR"
    };  
    
};



export const method = {
    loginServicio : tryCatchDatos( loginUsuario ),
};