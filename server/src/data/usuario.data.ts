import bcrypt from 'bcryptjs';

import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { iud, select } from "../utils/baseDatos";
import {  CrearInputsUsuario, ModInputsUsuario, VerificarUsuario, ModInputsUsuarioPriv, ModInputsContrasena, FiltroUsuarios } from "../squemas/usuario";
import { TipadoData, DataUsuarioNuevo, DataModPublico, DataIdUsuario, DataModPrivado ,UsuarioListado, DataMiPerfil, ModMiPerfilInput } from "../tipados/tipado.data";



// funcion para ver si un usuario ya existe
//para verificar si un usuario ya existe en la base de datos
// y evitar duplicados al crear un nuevo usuario
const buscarUsuario= async (usuario : string) : Promise<TipadoData<DataUsuarioNuevo>> => {
    const sql = `SELECT * FROM usuarios WHERE usuario = ?;`;
    const valores = [usuario];
    const resultado = await select(sql, valores);
    if (resultado.length <= 0) {
        return {
            error: false,
            message: "Usuario disponible",
            paginacion : undefined,
            code: "USER_AVAILABLE",
            errorsDetails: undefined
        };
    };
        throw new ClientError("Verificar el Usuario", 404, "USER_FOUND");
    }

const buscarIdUsuario = async (id: number): Promise<TipadoData<DataIdUsuario>> => {
    
    // 1. Cambiamos la consulta SQL para que busque por ID (esto es vital)
    const sql = `SELECT 
                    u.usuario,
                    u.rol,
                    e.razon_social,
                    p.tipo AS tipo,
                    s.estado AS estado_suscripcion
                FROM usuarios u
                INNER JOIN escuelas e 
                    ON u.id_escuela = e.id_escuela
                LEFT JOIN suscripciones_escuelas s 
                    ON e.id_escuela = s.id_escuela 
                LEFT JOIN planes_saas p 
                    ON s.id_plan_saas = p.id_plan
                WHERE u.id_usuario = ?
                ORDER BY s.id_suscripcion DESC -- O podés ordenar por fecha, ej: s.created_at DESC
                LIMIT 1;`;
    const valores = [id];    
    
    // 2. Le decimos a TS que el resultado es un array de objetos con la columna 'usuario'
    // Usamos <any[]> o una interfaz específica si la tenés
    const resultado = await select(sql, valores) as any[]; 


    if (resultado.length <= 0) {
        return {
            error: true,
            message: "Usuario no encontrado",
            data: null as any,
            code: "USER_NOT_FOUND"
        };
    }

    // 4. Ahora sí, TS sabe que resultado[0] tiene la propiedad usuario
    return {
        error: false,
        message: "Usuario encontrado",
        data: { 
            usuario: resultado[0].usuario,
            rol : resultado[0].rol,
            razon_social : resultado[0].razon_social,
            tipo : resultado[0].tipo,
            estado_suscripcion : resultado[0].estado_suscripcion
        }, 
        code: "USER_FOUND",
    };
};

const crearUsuario = async (usuarioData: CrearInputsUsuario) : Promise<TipadoData<DataUsuarioNuevo>> => {
    const { usuario, contrasena, nombre, apellido, celular, rol, correo, estado ,id_escuela} = usuarioData;
    const hashedPassword = await bcrypt.hash(contrasena, 10); // Hasheamos la contraseña antes de guardarla
    const sql =`INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado,  id_escuela)
                VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ?);`;
    const valores= [usuario, hashedPassword, nombre, apellido, celular, rol, correo, estado , id_escuela];
  
    const insertar = await iud(sql, valores);

    if (insertar.affectedRows === 0) {
        throw new ClientError("No se pudo crear el usuario", 500, "CREATION_FAILED");
    }

    return {
        error : false,
        message: "Usuario creado exitosamente",
        data : { usuario : usuarioData.usuario , correo : usuarioData.correo },
        code : "USER_CREATED", 
        errorsDetails: undefined
    }
};

const  modUsuarioPublico = async(usuarioDataMod : ModInputsUsuario , usuarioID : VerificarUsuario): Promise<TipadoData<DataModPublico>> =>{
    const { nombre, apellido, celular , correo } = usuarioDataMod ;
    const { usuario } = usuarioID ;

    const sql =`UPDATE usuarios
                SET
                    nombre = ?,          
                    apellido = ?,        
                    celular = ?,         
                    correo = ?           
                WHERE
                    usuario = ?;`

    const valores = [nombre,apellido,celular,correo,usuario];
    const modificar = await iud(sql, valores);
    if (modificar.affectedRows === 0)  throw new ClientError("No se logro modificar el Usuario", 500 , "UPDATE_FAILED" ); 
    return{
            error: false,
            message: "Usuario Modifcado exitosamente",
            data: { usuario , nombre , apellido, celular, correo}, 
            paginacion : undefined,
            code: "USER_UPDATED",
            errorsDetails: undefined
    }

};

const modUsuarioPrivado = async(usuarioDataMod :ModInputsUsuarioPriv , usuarioID : VerificarUsuario) : Promise<TipadoData<DataModPrivado>> =>{
    const {rol , estado  } = usuarioDataMod ;
    const { usuario } = usuarioID ;

    const sql =`UPDATE usuarios
                SET
                    rol = ?,        
                    estado = ?          
                WHERE
                    usuario = ?;`
    const valores = [ rol , estado , usuario];
    const  resultado = await iud(sql , valores) ;
    if ( resultado.affectedRows === 0) throw new ClientError("No se logro modificar el Usuario", 500 ,"UPDATE_FAILED");
        return{
            error: false,
            message: "Usuario Modifcado exitosamente",
            data: { usuario , rol , estado}, 
            paginacion : undefined,
            code: "USER_UPDATED",
            errorsDetails: undefined
    }

};

const modUsuarioContrasena = async(parametro : ModInputsContrasena): Promise<TipadoData<DataModPrivado>>  =>{
    const { contrasena_nueva, contrasena_actual ,usuario} = parametro ;
    
    const sqlIdUsuario =`SELECT contrasena FROM usuarios WHERE usuario = ?;`;
    const valorSelect = [usuario];
    const id = await select<{ contrasena: string }>(sqlIdUsuario, valorSelect);
    if ( id.length <= 0) throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    
    const { contrasena } = id[0];// es la contraseña q viene de la bd
    const verificarPassword = await bcrypt.compare(contrasena_actual , contrasena);
    if ( verificarPassword === false) throw new ClientError("La contraseña actual es incorrecta.", 401, "INVALID_PASSWORD")
    const nuevaPasswordHash = await bcrypt.hash(contrasena_nueva, 10);
    const sqlModificarPassword = `  UPDATE usuarios
                                    SET
                                        contrasena = ?   
                                    WHERE
                                        usuario = ?;`;

    const valorMod = [nuevaPasswordHash , usuario];
    const modificar = await iud(sqlModificarPassword , valorMod);
    if (modificar.affectedRows === 0) throw new ClientError("No se logro cambiar la contraseña" , 500 , "PASSWORD_UPDATE_FAIL");
    return{
        error: false,
        message: "Contraseña cambiada",
        data: { usuario : usuario}, 
        paginacion : undefined,
        code: "PASSWORD_UPDATED",
        errorsDetails: undefined
    }
};

/**
 * Permite al usuario autenticado modificar su propio usuario, contraseña, correo y/o celular.
 * Requiere verificar la contraseña actual.
 */
const modMiPerfil = async (parametro: ModMiPerfilInput): Promise<TipadoData<DataMiPerfil>> => {
    const { usuario_id, nuevo_usuario, nueva_contrasena, correo, celular, contrasena_actual } = parametro;

    // 1. Obtener contraseña actual hasheada y datos del usuario
    const sqlSelect = `SELECT contrasena, usuario, nombre, apellido, correo, celular, rol, id_escuela FROM usuarios WHERE id_usuario = ?;`;
    const resultado = await select<{ contrasena: string; usuario: string; nombre: string; apellido: string; correo: string; celular: string; rol: string; id_escuela: number }>(sqlSelect, [usuario_id]);
    
    if (resultado.length <= 0) {
        throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }

    const { contrasena: hashActual, usuario: usuarioBD, nombre: nombreBD, apellido: apellidoBD, correo: correoBD, celular: celularBD, rol, id_escuela } = resultado[0];

    // 2. Verificar contraseña actual
    const passwordValida = await bcrypt.compare(contrasena_actual, hashActual);
    if (!passwordValida) {
        throw new ClientError("La contraseña actual es incorrecta.", 401, "INVALID_PASSWORD");
    }

    let usuarioFinal = usuarioBD;
    let nombreFinal = nombreBD;
    let apellidoFinal = apellidoBD;
    let correoFinal = correoBD;
    let celularFinal = celularBD;

    // 3. Si se quiere cambiar el usuario, verificar que no exista y actualizar
    if (nuevo_usuario && nuevo_usuario !== usuarioBD) {
        const existe = await select<{ usuario: string }>(`SELECT usuario FROM usuarios WHERE usuario = ?;`, [nuevo_usuario]);
        if (existe.length > 0) {
            throw new ClientError("El nombre de usuario ya está en uso.", 409, "USERNAME_TAKEN");
        }
        await iud(`UPDATE usuarios SET usuario = ? WHERE id_usuario = ?;`, [nuevo_usuario, usuario_id]);
        usuarioFinal = nuevo_usuario;
    }

    // 4. Si se quiere cambiar el correo, verificar que no exista y actualizar
    if (correo !== undefined && correo !== correoBD) {
        const existeCorreo = await select<{ correo: string }>(`SELECT correo FROM usuarios WHERE correo = ?;`, [correo]);
        if (existeCorreo.length > 0) {
            throw new ClientError("El correo electrónico ya está en uso.", 409, "EMAIL_TAKEN");
        }
        await iud(`UPDATE usuarios SET correo = ? WHERE id_usuario = ?;`, [correo, usuario_id]);
        correoFinal = correo;
    }

    // 5. Si se quiere cambiar el celular, actualizar (sin validación de unicidad)
    if (celular !== undefined && celular !== celularBD) {
        await iud(`UPDATE usuarios SET celular = ? WHERE id_usuario = ?;`, [celular, usuario_id]);
        celularFinal = celular;
    }

    // 6. Si se quiere cambiar la contraseña, hashear y actualizar
    if (nueva_contrasena) {
        const nuevoHash = await bcrypt.hash(nueva_contrasena, 10);
        await iud(`UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?;`, [nuevoHash, usuario_id]);
    }

    return {
        error: false,
        message: "Perfil actualizado correctamente",
        data: { usuario: usuarioFinal, nombre: nombreFinal, apellido: apellidoFinal, correo: correoFinal, celular: celularFinal, rol, id_escuela },
        code: "PROFILE_UPDATED",
        errorsDetails: undefined
    };
};

/**
 * Obtiene el perfil completo del usuario autenticado.
 */
const obtenerMiPerfil = async (usuario_id: number): Promise<TipadoData<DataMiPerfil>> => {
    const sql = `SELECT usuario, nombre, apellido, correo, celular, rol, id_escuela 
                 FROM usuarios WHERE id_usuario = ?;`;
    const resultado = await select<{ 
        usuario: string; 
        nombre: string; 
        apellido: string; 
        correo: string; 
        celular: string; 
        rol: string; 
        id_escuela: number 
    }>(sql, [usuario_id]);

    if (resultado.length <= 0) {
        throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }

    const { usuario, nombre, apellido, correo, celular, rol, id_escuela } = resultado[0];

    return {
        error: false,
        message: "Perfil obtenido correctamente",
        data: { usuario, nombre, apellido, correo, celular, rol, id_escuela },
        code: "PROFILE_FETCHED",
        errorsDetails: undefined
    };
};

const listadoUsuario = async( 
    parametros : FiltroUsuarios, 
    pagina : number 
): Promise<TipadoData<UsuarioListado[]>> =>{
    const {usuario ,nombre , apellido , rol , correo , estado, limit , offset  } =parametros;

    const sqlLitado =` SELECT * FROM usuarios
                        WHERE
                            usuario LIKE ? AND
                            nombre LIKE ? AND
                            apellido LIKE ? AND
                            rol = ? AND
                            correo LIKE ? AND
                            estado = ?
                        ORDER BY usuario
                        LIMIT ${limit} OFFSET ${offset};`

    const valores = [usuario, nombre , apellido, rol , correo, estado];
    const resultado = await select<UsuarioListado>(sqlLitado , valores);
    
    if (resultado.length <= 0) throw new ClientError(`No hay Usuarios ${estado} `, 404 ,"NO_ACTIVE_USERS");
    
    const sqlContador =`SELECT count(*) as totalUsuario FROM usuarios
                        WHERE
                            usuario LIKE ? AND
                            nombre LIKE ? AND
                            apellido LIKE ? AND
                            rol = ? AND
                            correo LIKE ? AND
                            estado = ?; `;
    const valoresContador  = [ usuario, nombre, apellido , rol, correo,estado]; 
    const resultadoContador = await select<{ totalUsuario: number }>( sqlContador , valoresContador);
    const  { totalUsuario } = resultadoContador[0];
    
    const totalPagina =  Math.ceil(totalUsuario / limit);  
    

    return{
        error : false ,
        message : `Listado Usuarios : ${estado} `,
        data : resultado,
        paginacion : {
            pagina : Number(pagina),
            limite : limit,
            contadorPagina: totalPagina
        },
        code : "USERS_LISTED",
        errorsDetails: undefined
    }

};



export const method = {
    crearUsuario            : tryCatchDatos(crearUsuario),
    buscarUsuario           : tryCatchDatos(buscarUsuario),
    buscarIdUsuario         : tryCatchDatos(buscarIdUsuario),
    modUsuarioPublico       : tryCatchDatos(modUsuarioPublico),
    modUsuarioPrivado       : tryCatchDatos(modUsuarioPrivado),
    modUsuarioContrasena    : tryCatchDatos(modUsuarioContrasena),
    modMiPerfil             : tryCatchDatos(modMiPerfil),
    obtenerMiPerfil         : tryCatchDatos(obtenerMiPerfil),
    listadoUsuario          : tryCatchDatos(listadoUsuario)
}