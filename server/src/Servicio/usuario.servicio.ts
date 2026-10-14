import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataUsuario } from "../data/usuario.data";
import { TipadoData } from "../tipados/tipado.data";
import { ModInputsMiPerfil, modMiPerfilSchema } from "../squemas/usuario";
import { registroHistorial } from "../utils/postHistorial";
import { type HistorialInputs } from "../squemas/historial";

/**
 * Obtiene el perfil completo del usuario autenticado.
 * 
 * @param data - Objeto con usuario_id (viene del token via handleControladores)
 * @returns Perfil con usuario, nombre, apellido, correo, celular, rol, id_escuela
 */
const obtenerMiPerfil = async (data: { usuario_id: number }): Promise<TipadoData<{
    usuario: string;
    nombre: string;
    apellido: string;
    correo: string;
    celular: string;
    rol: string;
    id_escuela: number;
}>> => {
    const usuario_id = data.usuario_id;
    const resultado = await dataUsuario.obtenerMiPerfil(usuario_id);

    if (resultado.code === "PROFILE_FETCHED") {
        return {
            error: false,
            message: "Perfil obtenido correctamente",
            data: resultado.data,
            code: "PROFILE_FETCHED"
        };
    }

    return {
        error: true,
        message: "Error en el servidor al obtener perfil",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Modifica el perfil del usuario autenticado (usuario, contraseña, correo, celular).
 * Requiere contraseña actual para verificación.
 * Valida unicidad de usuario y correo.
 * Registra en historial.
 * 
 * @param data - Datos del body + usuario_id del token
 * @returns Perfil actualizado
 */
const modMiPerfil = async (data: ModInputsMiPerfil & { usuario_id: number }): Promise<TipadoData<{
    usuario: string;
    nombre: string;
    apellido: string;
    correo: string;
    celular: string;
    rol: string;
    id_escuela: number;
}>> => {
    // 1. Validación Zod (primera línea)
    const parametros = modMiPerfilSchema.parse(data);

    // 2. Validación de unicidad de correo EN SERVICE (antes de tocar BD)
    if (parametros.correo !== undefined) {
        const existeCorreo = await dataUsuario.buscarPorCorreo(parametros.correo, data.usuario_id);
        if (existeCorreo.code === "EMAIL_TAKEN") {
            return {
                error: true,
                message: "El correo electrónico ya está en uso",
                code: "EMAIL_TAKEN"
            };
        }
    }

    // 3. Ejecutar modificación en data layer
    const resultado = await dataUsuario.modMiPerfil({
        usuario_id: data.usuario_id,
        nuevo_usuario: parametros.nuevo_usuario,
        nueva_contrasena: parametros.nueva_contrasena,
        correo: parametros.correo,
        celular: parametros.celular,
        contrasena_actual: parametros.contrasena_actual,
    });

    // 3. Traducir códigos de data a códigos de servicio
    if (resultado.code === "PROFILE_UPDATED" && resultado.data) {
        // 4. Registrar historial (async, no bloqueante)
        const dataHistorial: HistorialInputs = {
            id_escuela: resultado.data.id_escuela,
            id_usuario: data.usuario_id,
            modulo: "USUARIOS",
            accion: "MODIFICAR",
            id_registro: data.usuario_id,
            descripcion: `Modificación de perfil de usuario ${resultado.data.usuario}`,
            datos: {
                usuario: resultado.data.usuario,
                correo: resultado.data.correo,
                celular: resultado.data.celular
            }
        };
        await registroHistorial(dataHistorial).catch((err: Error) => 
            console.error("Error registrando historial modMiPerfil:", err)
        );

        return {
            error: false,
            message: "Perfil actualizado correctamente",
            data: resultado.data,
            code: "PROFILE_UPDATED"
        };
    }

    if (resultado.code === "USERNAME_TAKEN") {
        return {
            error: true,
            message: "El nombre de usuario ya está en uso",
            code: "USERNAME_TAKEN"
        };
    }

    if (resultado.code === "EMAIL_TAKEN") {
        return {
            error: true,
            message: "El correo electrónico ya está en uso",
            code: "EMAIL_TAKEN"
        };
    }

    if (resultado.code === "INVALID_PASSWORD") {
        return {
            error: true,
            message: "La contraseña actual es incorrecta",
            code: "INVALID_PASSWORD"
        };
    }

    if (resultado.code === "USER_NOT_FOUND") {
        return {
            error: true,
            message: "Usuario no encontrado",
            code: "USER_NOT_FOUND"
        };
    }

    // Fallback
    return {
        error: true,
        message: "Error en el servidor al modificar perfil",
        code: "ERROR_SERVIDOR"
    };
};

export const method = {
    obtenerMiPerfil: tryCatchDatos(obtenerMiPerfil),
    modMiPerfil: tryCatchDatos(modMiPerfil)
};