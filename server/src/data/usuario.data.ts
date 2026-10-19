import bcrypt from 'bcryptjs';

import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { iud, select } from "../utils/baseDatos";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { TipadoData, DataIdUsuario, DataMiPerfil, ModMiPerfilInput } from "../tipados/tipado.data";



/**
 * Verifica si un correo ya está en uso en la tabla `usuarios`.
 *
 * Permite excluir un `id_usuario` para que un usuario pueda conservar su
 * propio correo al modificar su perfil. Delega la búsqueda al hook genérico
 * `buscarExistenteEntidad` (NO lanza errores: devuelve el resultado).
 *
 * @param correo - Correo a validar.
 * @param excluirId - id_usuario que queda fuera de la búsqueda (opcional).
 * @returns {Promise<TipadoData<{ id_usuario: number; correo: string }>>}
 *   `CORREO_EXISTE` con la fila si el correo ya está tomado /
 *   `CORREO_NO_EXISTE` si el correo está libre.
 */
const buscarPorCorreo = async (
    correo: string,
    excluirId?: number
): Promise<TipadoData<{ id_usuario: number; correo: string }>> => {

    let sql = `SELECT id_usuario, correo FROM usuarios WHERE correo = ?`;
    const valores: unknown[] = [correo];

    if (excluirId !== undefined) {
        sql += ` AND id_usuario != ?`;
        valores.push(excluirId);
    }

    return await buscarExistenteEntidad({
        slqEntidad: sql,
        valores: valores,
        entidad: "CORREO"
    });
};

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

    // 2. Verificar contraseña actual SOLO si se envía.
    //    Es obligatoria únicamente al cambiar la contraseña (lo garantiza el refine
    //    de modMiPerfilSchema); para modificar otros datos no se requiere.
    if (contrasena_actual !== undefined) {
        const passwordValida = await bcrypt.compare(contrasena_actual, hashActual);
        if (!passwordValida) {
            throw new ClientError("La contraseña actual es incorrecta.", 401, "INVALID_PASSWORD");
        }
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

    // 4. Si se quiere cambiar el correo, actualizar (validacion ya hecha en Service)
    if (correo !== undefined && correo !== correoBD) {
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
 *
 * Delega la búsqueda al hook genérico `buscarExistenteEntidad` (NO lanza
 * errores: devuelve el resultado para que el Servicio lo traduzca).
 *
 * @param usuario_id - id_usuario del usuario logueado (viene del token).
 * @returns {Promise<TipadoData<DataMiPerfil>>}
 *   `PERFIL_EXISTE` con la fila del perfil /
 *   `PERFIL_NO_EXISTE` si no existe ese usuario.
 */
const obtenerMiPerfil = async (usuario_id: number): Promise<TipadoData<DataMiPerfil>> => {
    const sql = `SELECT usuario, nombre, apellido, correo, celular, rol, id_escuela 
                 FROM usuarios WHERE id_usuario = ?;`;

    return await buscarExistenteEntidad<DataMiPerfil>({
        slqEntidad: sql,
        valores: [usuario_id],
        entidad: "PERFIL"
    });
};

export const method = {
    buscarPorCorreo         : tryCatchDatos(buscarPorCorreo),
    buscarIdUsuario         : tryCatchDatos(buscarIdUsuario),
    modMiPerfil             : tryCatchDatos(modMiPerfil),
    obtenerMiPerfil         : tryCatchDatos(obtenerMiPerfil)
}