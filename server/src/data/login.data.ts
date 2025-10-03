import bcrypt from 'bcryptjs';
import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { LoginInputs } from "../squemas/login";
import { TipadoData, DataLogin , UsuarioListado } from "../tipados/tipado.data";
import { select } from "../utils/baseDatos";

const login = async( params : LoginInputs )  : Promise<TipadoData<DataLogin>> => {
    const sql = `SELECT * FROM usuarios WHERE usuario = ?`;
    const valores = [params.usuario];
    const resultado = await select<UsuarioListado>(sql, valores);
    if (resultado.length === 0) {
        throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }
    const passwordValida = await bcrypt.compare(params.contrasena, resultado[0].contrasena);
    if (!passwordValida) {
        throw new ClientError("Credenciales Invalidas", 401, "INVALID_PASSWORD");
    }
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



export const method ={
    login: tryCatchDatos(login),
}