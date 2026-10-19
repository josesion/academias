import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataUsuario } from "../data/usuario.data";
import { TipadoData, DataMiPerfil } from "../tipados/tipado.data";
import { ModInputsMiPerfil, modMiPerfilSchema } from "../squemas/usuario";
import { registroHistorial } from "../utils/postHistorial";
import { type HistorialInputs } from "../squemas/historial";

/**
 * Valida si un string es un email válido.
 */
const esEmailValido = (str: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
};

/**
 * Obtiene el perfil completo del usuario autenticado.
 *
 * La data (hook `buscarExistenteEntidad`, entidad "PERFIL") devuelve
 * `PERFIL_EXISTE` con la fila o `PERFIL_NO_EXISTE`. Acá se traduce al código
 * que espera `MAPA_OBTENER_PERFIL`.
 *
 * @param data - Objeto con usuario_id (viene del token via handleControladores)
 * @returns Perfil con usuario, nombre, apellido, correo, celular, rol, id_escuela
 */
const obtenerMiPerfil = async (data: { usuario_id: number }): Promise<TipadoData<DataMiPerfil>> => {
    const resultado = await dataUsuario.obtenerMiPerfil(data.usuario_id);

    if (resultado.code === "PERFIL_EXISTE") {
        return {
            error: false,
            message: "Perfil obtenido correctamente",
            data: resultado.data,
            code: "PROFILE_FETCHED"
        };
    }

    if (resultado.code === "PERFIL_NO_EXISTE") {
        return {
            error: true,
            message: "Usuario no encontrado",
            code: "USER_NOT_FOUND"
        };
    }

    // Salvavidas: ningún code conocido llegó desde la data
    return {
        error: true,
        message: "Error en el servidor al obtener perfil",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Modifica el perfil del usuario autenticado (usuario, contraseña, correo, celular).
 *
 * Valida TODO antes de tocar la BD, ramificando por rol (el rol sale del token):
 *
 * - Contraseñas: van juntas o ninguna (garantiza el refine del schema). Si vienen
 *   ambas, se verifica que la actual sea correcta (`INVALID_PASSWORD`).
 * - Rol "alumno": el correo ES el login y debe quedar unificado en 3 columnas
 *   (`usuarios.correo`, `usuarios.usuario`, `alumnos.email`). El frontend fuerza
 *   correo = usuario; si llegaran distintos se frena (`ALUMNO_CAMPOS_DIFERENTES`).
 * - Rol NO alumno: correo y usuario se validan por separado.
 *
 * Registra el cambio en historial.
 *
 * La data SOLO escribe (SET dinámico + transacción de `alumnos.email` para
 * alumno); ya no verifica contraseña ni unicidad.
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

    // 2. Obtener datos actuales del usuario para conocer su rol
    const perfilActual = await dataUsuario.obtenerMiPerfil(data.usuario_id);
    if (perfilActual.code !== "PERFIL_EXISTE" || !perfilActual.data) {
        return {
            error: true,
            message: "Usuario no encontrado",
            code: "USER_NOT_FOUND"
        };
    }

    // 3. Normalización: string vacío en contraseñas = "sin cambio"
    //    (el schema acepta '' para no frenar el PUT; acá se descarta).
    const contrasenaActual = parametros.contrasena_actual || undefined;
    const nuevaContrasena = parametros.nueva_contrasena || undefined;

    // 4. Validación de contraseñas (regla "las dos o ninguna", garantizada
    //    por el refine del schema). Si vienen ambas, se verifica que la
    //    actual sea correcta ANTES de tocar la BD.
    if (nuevaContrasena !== undefined && contrasenaActual !== undefined) {
        const verificacion = await dataUsuario.verificarContrasenaActual(data.usuario_id, contrasenaActual);

        if (verificacion.code === "CONTRASENA_INVALIDA") {
            return {
                error: true,
                message: "La contraseña actual es incorrecta",
                code: "INVALID_PASSWORD"
            };
        }

        if (verificacion.code === "USER_NOT_FOUND") {
            return {
                error: true,
                message: "Usuario no encontrado",
                code: "USER_NOT_FOUND"
            };
        }
    }

    const esAlumno = perfilActual.data.rol === "alumno";
    // Se resuelve una sola vez y se REUTILIZA: para excluir al alumno de su
    // propio choque de correo (6a) y para que la data sincronize alumnos.email.
    let dniAlumno: number | undefined;

    // 4b. El dni se resuelve SIEMPRE para alumno (no solo si viene correo),
    //     porque de él depende poder sincronizar alumnos.email al escribir.
    if (esAlumno) {
        const dni = await dataUsuario.buscarDniAlumno(data.usuario_id);
        dniAlumno = dni.code === "DNI_ALUMNO_EXISTE" ? dni.data?.dni_alumno : undefined;
    }

    // 5. Guardia de unificación para rol alumno: el frontend fuerza
    //    correo = usuario en todo PUT (spec 036). Si llegaran distintos, se frena.
    if (esAlumno
        && parametros.correo !== undefined
        && parametros.nuevo_usuario !== undefined
        && parametros.correo !== parametros.nuevo_usuario) {
        return {
            error: true,
            message: "Para un alumno, usuario y correo deben ser el mismo valor",
            code: "ALUMNO_CAMPOS_DIFERENTES"
        };
    }

    if (esAlumno) {
        // 6a. Rama ALUMNO: el correo es el LOGIN y va unificado en 3 columnas
        //     (usuarios.correo, usuarios.usuario y alumnos.email).
        if (parametros.nuevo_usuario !== undefined && !esEmailValido(parametros.nuevo_usuario)) {
            return {
                error: true,
                message: "Para rol alumno el usuario debe ser un email válido",
                code: "USERNAME_MUST_BE_EMAIL"
            };
        }

        // El correo viaja SIEMPRE en todo PUT de alumno, pero por las dudas se
        // usa el que venga (correo, o en su defecto nuevo_usuario).
        const correoAlumno = parametros.correo ?? parametros.nuevo_usuario;

        if (correoAlumno !== undefined) {
            // El dni ya se resolvió arriba (4b); acá solo se usa para excluir
            // al alumno de su propio choque de correo.
            const existeCorreo = await dataUsuario.buscarCorreoAlumno(correoAlumno, data.usuario_id, dniAlumno);
            if (existeCorreo.code === "CORREO_EXISTE") {
                return {
                    error: true,
                    message: "El correo electrónico ya está en uso",
                    code: "EMAIL_TAKEN"
                };
            }
        }
    } else {
        // 6b. Rama NO alumno: correo y usuario son campos independientes.
        if (parametros.correo !== undefined) {
            const existeCorreo = await dataUsuario.buscarCorreoUsuario(parametros.correo, data.usuario_id);
            if (existeCorreo.code === "CORREO_EXISTE") {
                return {
                    error: true,
                    message: "El correo electrónico ya está en uso",
                    code: "EMAIL_TAKEN"
                };
            }
        }

        if (parametros.nuevo_usuario !== undefined) {
            const existeUsuario = await dataUsuario.buscarUsuarioDisponible(parametros.nuevo_usuario, data.usuario_id);
            if (existeUsuario.code === "USUARIO_EXISTE") {
                return {
                    error: true,
                    message: "El nombre de usuario ya está en uso",
                    code: "USERNAME_TAKEN"
                };
            }
        }
    }

    // 7. Freno: sin dni no se puede garantizar que `alumnos.email` quede
    //    sincronizado con `usuarios.correo`. No se escribe NADA (tampoco
    //    celular o contraseña) para no dejar los datos a medias. El mensaje
    //    NO revela el detalle del dni: se reporta como falla interna.
    if (esAlumno && dniAlumno === undefined) {
        return {
            error: true,
            message: "Error interno al procesar la solicitud. Intente nuevamente.",
            code: "ALUMNO_SIN_DNI"
        };
    }

    // 8. Escritura en data layer. Ya NO se pasa contrasena_actual (la validó el
    //    Servicio); se le pasa el dni para que sincronice alumnos.email.
    const resultado = await dataUsuario.modMiPerfil({
        usuario_id: data.usuario_id,
        nuevo_usuario: parametros.nuevo_usuario,
        nueva_contrasena: nuevaContrasena,
        correo: parametros.correo,
        celular: parametros.celular,
        dni_alumno: dniAlumno,
    });

    // 9. Traducir códigos de data a códigos de servicio
    if (resultado.code === "PROFILE_UPDATED" && resultado.data) {
        // 10. Registrar historial (async, no bloqueante)
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

    // La transacción de 2 tablas (usuarios + alumnos) pudo fallar: FK, deadlock, etc.
    if (resultado.code === "TRANSACCION_FALLIDA") {
        return {
            error: true,
            message: "No se pudo actualizar el perfil",
            code: "ERROR_SERVIDOR"
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