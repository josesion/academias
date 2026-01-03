import bcrypt from 'bcryptjs';

import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { iud, select } from "../utils/baseDatos";
import {  CrearInputsUsuario, ModInputsUsuario, VerificarUsuario, ModInputsUsuarioPriv, ModInputsContrasena, FiltroUsuarios } from "../squemas/usuario";
import { TipadoData, DataUsuarioNuevo, DataModPublico, DataIdUsuario, DataModPrivado ,UsuarioListado} from "../tipados/tipado.data";



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

const buscarIdUsuario =  async(usuario : string): Promise<TipadoData<DataIdUsuario>>  =>{
    const sql = `SELECT * FROM usuarios WHERE usuario = ?;`;
    const valores = [usuario];    
    const resultado = await select(sql, valores);
    if (resultado.length <= 0 ) throw new ClientError("Uusario no encontrado " , 500 ,"USER_NOT_FOUND");
    return {
        error: false,
        message: "Usuario encontrado",
        data: { usuario : usuario }, //no retorno nada para cuidar la privacidad
        paginacion : undefined,
        code: "USER_FOUND",
        errorsDetails: undefined
    }
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
    listadoUsuario          : tryCatchDatos(listadoUsuario)
}