import { Request, Response } from "express";

import {crearUsuarioSchema, CrearInputsUsuario, 
        ModInputsUsuario , modUsuarioSchema, 
        VerificarUsuario ,verificarUsuarioSchema,
        ModInputsUsuarioPriv,modUsuarioSchemaPrivado,
        ModInputsContrasena , modContrasenaSchema,
        FiltroUsuarios , listaUsuariosSchema} from "../squemas/usuario";
import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";

import { method as usuariosData } from "../data/usuario.data";

/**
 * Controlador para la creación de un nuevo usuario.
 * 
 * @param req - Objeto de solicitud HTTP que contiene en el `body` los datos del usuario.
 * @param res - Objeto de respuesta HTTP usado para devolver el resultado al cliente.
 * 
 * El flujo del proceso es:
 * 1. Validar la estructura y datos del cuerpo (`req.body`) usando Zod (`crearUsuarioSchema`).
 * 2. Verificar si el nombre de usuario ya está registrado (`usuariosData.buscarUsuario`).
 *    - Si el usuario ya existe, responde con error 404 y código `USER_FOUND`.
 * 3. Si no existe, se procede a crear el usuario (`usuariosData.crearUsuario`).
 * 4. Devuelve una respuesta con estado 201, incluyendo los datos del nuevo usuario y código `USER_CREATED`.
 * 
 * @returns Respuesta HTTP con los datos del usuario creado o error correspondiente.
 */

const crearUsuario = async ( req : Request , res : Response )=> {
    const usuarioData : CrearInputsUsuario = crearUsuarioSchema.parse(req.body);
    const usuarioExiste = await usuariosData.buscarUsuario( usuarioData.usuario );
    if (usuarioExiste.error && usuarioExiste.code === "USER_FOUND") {// si es true , significa que el usuario ya existe
        return enviarResponseError(res, 404, usuarioExiste.message, usuarioExiste.code, usuarioExiste.errorsDetails);
    }
    const resultado = await usuariosData.crearUsuario(usuarioData);
    return enviarResponse( res, 201, resultado.message,  resultado.data, undefined , resultado.code);
}

/**
 * Controlador para modificar los datos públicos de un usuario existente.
 * 
 * @param req - Objeto de solicitud HTTP que contiene:
 *   - en `params.usuario`: el identificador del usuario a modificar,
 *   - en `body`: los nuevos datos públicos del usuario (nombre, apellido, celular, correo).
 * @param res - Objeto de respuesta HTTP usado para devolver el resultado al cliente.
 * 
 * Flujo de la función:
 * 1. Valida el parámetro `usuario` con Zod (`verificarUsuarioSchema`).
 * 2. Valida los datos del cuerpo (`req.body`) con `modUsuarioSchema`.
 * 3. Busca el ID del usuario a modificar usando `usuariosData.buscarIdUsuario`.
 * 4. Ejecuta la actualización de los datos públicos mediante `usuariosData.modUsuarioPublico`.
 * 5. Devuelve una respuesta HTTP 200 con los datos modificados.
 * 
 * @returns Respuesta HTTP con mensaje de éxito y los nuevos datos del usuario, o error correspondiente.
 */

const modUsuarioPublic = async( req : Request , res : Response) =>{
    const { usuario } = req.params;
    const verUsu : VerificarUsuario = verificarUsuarioSchema.parse({usuario});
    const  modDataUsuario : ModInputsUsuario = modUsuarioSchema.parse(req.body);

    const usuarioID = await usuariosData.buscarIdUsuario( verUsu.usuario );
    const resultado = await usuariosData.modUsuarioPublico(modDataUsuario, usuarioID.data);
    return enviarResponse(res, 200 , resultado.message , resultado.data ,undefined, resultado.code);
}

/**
 * Controlador para modificar los datos privados de un usuario (como rol y estado).
 * 
 * @param req - Objeto de solicitud HTTP que contiene:
 *   - en `params.usuario`: el nombre del usuario a modificar,
 *   - en `body`: los nuevos datos privados (`rol`, `estado`).
 * @param res - Objeto de respuesta HTTP que devuelve el resultado al cliente.
 * 
 * Flujo del proceso:
 * 1. Valida el nombre de usuario recibido por parámetro usando Zod.
 * 2. Valida el body de la solicitud con `modUsuarioSchemaPrivado`.
 * 3. Busca el ID del usuario en base de datos con `usuariosData.buscarIdUsuario`.
 * 4. Realiza la modificación de los datos privados con `usuariosData.modUsuarioPrivado`.
 * 5. Devuelve una respuesta HTTP 200 con los datos modificados.
 * 
 * @returns Respuesta con mensaje de éxito y datos del usuario actualizados, o error en caso de fallar.
 */
const modUsuarioPrivado = async( req : Request, res : Response) =>{
    const { usuario } = req.params;
    const verUsu : VerificarUsuario = verificarUsuarioSchema.parse({usuario});
    const modDataUsuario : ModInputsUsuarioPriv = modUsuarioSchemaPrivado.parse(req.body);

    const usuarioID = await usuariosData.buscarIdUsuario( verUsu.usuario );
    const resultado = await usuariosData.modUsuarioPrivado(modDataUsuario , usuarioID.data);
    return enviarResponse( res , 200 , resultado.message, resultado.data , undefined, resultado.code );

};

/**
 * Controlador para modificar (actualizar) la contraseña de un usuario.
 * 
 * @param req - Objeto de solicitud HTTP que contiene:
 *   - en `params.usuario`: el nombre del usuario,
 *   - en `body.password`: contraseña actual,cd
 *   - en `body.nuevaPassword`: nueva contraseña deseada.
 * 
 * Flujo del proceso:
 * 1. Valida los datos usando `modContrasenaSchema` (usuario, contraseña actual y nueva).
 * 2. Llama a `usuariosData.modUsuarioContrasena` para realizar el cambio de contraseña.
 *    - Este método verifica que la contraseña actual coincida con la almacenada.
 *    - Si es válida, hashea la nueva y actualiza en la base de datos.
 * 3. Devuelve una respuesta HTTP 200 con mensaje y usuario afectado.
 * 
 * @returns Respuesta HTTP con resultado del cambio de contraseña o error si falla la validación o modificación.
 */
const modUsuarioContrasena = async( req : Request, res : Response ) =>{
    const { usuario } = req.params;
    const { password,nuevaPassword } = req.body;
    const validar :ModInputsContrasena = modContrasenaSchema.parse({usuario : usuario,contrasena_actual : password, contrasena_nueva:nuevaPassword })

    const resultado = await usuariosData.modUsuarioContrasena({ contrasena_actual: validar.contrasena_actual , 
                                                                contrasena_nueva: validar.contrasena_nueva,
                                                                usuario, });
    return enviarResponse( res , 200 , resultado.message , resultado.data , undefined , resultado.code );    
};

/**
 * Controlador para obtener un listado de usuarios con filtros y paginación.
 *
 * @param req - Objeto de solicitud HTTP que contiene los parámetros de consulta (query parameters):
 * - `pagina`: Número de la página actual.
 * - `limit`: Cantidad de usuarios por página.
 * - `usuario` (opcional): Filtro por nombre de usuario (búsqueda parcial).
 * - `nombre` (opcional): Filtro por nombre (búsqueda parcial).
 * - `apellido` (opcional): Filtro por apellido (búsqueda parcial).
 * - `rol` (opcional): Filtro por rol (búsqueda exacta).
 * - `correo` (opcional): Filtro por correo electrónico (búsqueda parcial).
 * - `estado` (opcional): Filtro por estado (búsqueda exacta).
 *
 * Flujo del proceso:
 * 1. Extrae los parámetros de paginación (`pagina`, `limit`) y filtros del `req.query`.
 * 2. Calcula el `offset` basado en `pagina` y `limit` para la paginación.
 * 3. Valida todos los parámetros de consulta utilizando `listaUsuariosSchema` de Zod.
 * 4. Llama a `usuariosData.listadoUsuario` con los parámetros validados y el número de página.
 * - Este método realiza la consulta a la base de datos aplicando los filtros, ordenamiento, limit y offset.
 * - También obtiene el conteo total de usuarios para calcular la paginación.
 * 5. Devuelve una respuesta HTTP 200 con el listado de usuarios, información de paginación y un mensaje.
 *
 * @returns Respuesta HTTP con el listado de usuarios y detalles de paginación, o un error si falla la validación o la consulta a la base de datos.
 */

//http://localhost:4000/api/lista_usuario?usuario=%&nombre=%&apellido=%&rol=usuario&correo=%&estado=activos&limit=10&pagina=1

const listadoUsuario = async(req : Request , res : Response) =>{
    const { pagina , limit, usuario ,nombre , apellido , rol , correo , estado } = req.query ;
    const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
    const validacion : FiltroUsuarios = listaUsuariosSchema.parse({ estado : estado,
                                                                    usuario: usuario,
                                                                    nombre : nombre,
                                                                    apellido : apellido,
                                                                    correo : correo,
                                                                    rol    :rol,
                                                                    limit  : Number(limit),
                                                                    offset : offset,
                                                                    });
    const listado = await usuariosData.listadoUsuario(validacion, Number(pagina));

    return enviarResponse( res , 200 , listado.message ,listado.data, listado.paginacion , listado.code);
};


export const method = {
    crearUsuario      : tryCatch( crearUsuario ),
    modUsuarioPublic  : tryCatch( modUsuarioPublic ),
    modUsuarioPrivado : tryCatch( modUsuarioPrivado ),
    modUsuarioContrasena :tryCatch( modUsuarioContrasena),
    listadoUsuario    : tryCatch( listadoUsuario )
}