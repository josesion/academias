import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataUsuario } from "../data/usuario.data";
import { method as dataEscuela, type EscuelaLogoRow, type EscuelaLogoActualizado } from "../data/escuela.data";
import { TipadoData, DataMiPerfil } from "../tipados/tipado.data";
import { ModInputsMiPerfil, modMiPerfilSchema } from "../squemas/usuario";
import { GuardarImagenSchema, ImagenFlayerInputs } from "../squemas/flayer";
import { subirImagenR2, eliminarImagenR2 } from "../utils/subirImagen";
import { registroHistorial } from "../utils/postHistorial";
import { type HistorialInputs } from "../squemas/historial";

/** Formatos de logo aceptados (los mismos que el ABM de escuelas). Spec 051. */
const FORMATOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

/** Tope del logo: 2 MB, igual que el del ABM de escuelas. Spec 051. */
const TAMANO_MAX_IMAGEN = 2 * 1024 * 1024;

/** Carpeta del bucket de R2 donde viven los logos de escuela. */
const CARPETA_LOGO_ESCUELA = "logo_escuela/";

/**
 * Lo que devuelven los 3 endpoints del logo de la escuela (spec 051).
 * `public_id` NUNCA se expone al cliente.
 */
export interface EscuelaPerfilRetorno {
    id_escuela: number;
    razon_social: string;
    urlImagen: string | null;
}

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

/**
 * Obtiene los datos de la escuela del usuario autenticado para la sección del
 * logo del perfil (spec 051).
 *
 * El `urlImagen` se calcula con un fallback en este orden:
 * 1. la columna `urlImagen` de la fila (si no es `NULL`);
 * 2. `${R2_PUBLIC_URL}/${public_id}` (fila editada por SQL con la URL vacía);
 * 3. `null` (escuela sin logo).
 *
 * `public_id` NO se expone: el cliente solo necesita una URL para la vista
 * previa, nunca la key del bucket.
 *
 * @param data - `id_escuela` tomado SIEMPRE del token (nunca del cliente).
 * @returns {Promise<TipadoData<EscuelaPerfilRetorno>>} `ESCUELA_PERFIL_FETCHED`
 *   (200) o `ESCUELA_NO_ENCONTRADA` (404).
 */
const obtenerEscuelaPerfil = async (
    data: { id_escuela: number }
): Promise<TipadoData<EscuelaPerfilRetorno>> => {
    const { id_escuela } = data;

    // Un administrador sin escuela (o un token sin id_escuela) no tiene fila.
    if (!id_escuela) {
        return {
            error: true,
            message: "No se encontró la escuela del usuario",
            code: "ESCUELA_NO_ENCONTRADA"
        };
    }

    let fila: TipadoData<EscuelaLogoRow>;

    try {
        fila = await dataEscuela.obtenerLogoEscuela(id_escuela);
    } catch (err) {
        console.error("Error consultando la escuela del usuario:", err);

        return {
            error: true,
            message: "No se pudo consultar la escuela del usuario.",
            code: "ERROR_SERVIDOR"
        };
    }

    // OJO: `buscarExistenteEntidad` devuelve `error: true` cuando la fila EXISTE.
    if (fila.code !== "ESCUELA_PERFIL_EXISTE" || !fila.data) {
        return {
            error: true,
            message: "No se encontró la escuela del usuario",
            code: "ESCUELA_NO_ENCONTRADA"
        };
    }

    const urlImagen = fila.data.urlImagen
        ?? (fila.data.public_id ? `${process.env.R2_PUBLIC_URL}/${fila.data.public_id}` : null);

    return {
        error: false,
        message: "Escuela obtenida correctamente",
        data: {
            id_escuela: fila.data.id_escuela,
            razon_social: fila.data.razon_social ?? "Mi escuela",
            urlImagen,
        },
        code: "ESCUELA_PERFIL_FETCHED"
    };
};

/**
 * Sube o reemplaza el logo de la escuela del usuario autenticado (spec 051).
 *
 * Las validaciones van ANTES de tocar la BD o R2 (R14: un error de multer sale
 * 500, por eso el formato y el tope viven acá):
 * 1. sin archivo → `ARCHIVO_REQUERIDO`;
 * 2. Zod `GuardarImagenSchema` (0 bytes → `VALIDATION_ERROR` por el handler global);
 * 3. formato fuera de jpeg/png/webp → `FORMATO_IMAGEN_INVALIDO`;
 * 4. más de 2 MB → `TAMANO_IMAGEN_INVALIDO`.
 *
 * El orden de R2 es el inverso al del ABM de escuelas (precedente
 * `empresa.servicios.ts:221-264`): primero se sube la imagen, después se
 * escribe la BD y recién al final se borra la vieja con `.catch`. Si el
 * `UPDATE` falla se borra la imagen recién subida (compensación) y la fila
 * conserva el logo anterior.
 *
 * El historial se registra SOLO después de un `UPDATE` exitoso y siempre con
 * `.catch`: un fallo de auditoría no revierte el cambio ni rompe la respuesta.
 *
 * @param data - `id_escuela` y `usuario_id` del token, más el archivo de `req.file`.
 * @returns {Promise<TipadoData<EscuelaPerfilRetorno>>} `ESCUELA_LOGO_ACTUALIZADO`
 *   (200) o el error de validación / R2 / servidor.
 */
const actualizarLogoEscuela = async (
    data: { id_escuela: number; usuario_id: number; archivo?: ImagenFlayerInputs }
): Promise<TipadoData<EscuelaPerfilRetorno>> => {
    const { id_escuela, usuario_id, archivo } = data;

    if (!archivo) {
        return {
            error: true,
            message: "Debe adjuntar una imagen",
            code: "ARCHIVO_REQUERIDO"
        };
    }

    // Zod: un archivo de 0 bytes revienta acá y el handler global lo traduce a 400.
    const validarImagen: ImagenFlayerInputs = GuardarImagenSchema.parse(archivo);

    if (!FORMATOS_IMAGEN.includes(validarImagen.tipo)) {
        return {
            error: true,
            message: "El formato de la imagen no está permitido.",
            code: "FORMATO_IMAGEN_INVALIDO"
        };
    }

    if (validarImagen.size > TAMANO_MAX_IMAGEN) {
        return {
            error: true,
            message: "La imagen no puede superar los 2 MB.",
            code: "TAMANO_IMAGEN_INVALIDO"
        };
    }

    // La escuela se lee ANTES de subir: sin fila no se ensucia R2.
    let fila: TipadoData<EscuelaLogoRow>;

    try {
        fila = await dataEscuela.obtenerLogoEscuela(id_escuela);
    } catch (err) {
        console.error("Error consultando la escuela del usuario:", err);

        return {
            error: true,
            message: "No se pudo consultar la escuela del usuario.",
            code: "ERROR_SERVIDOR"
        };
    }

    if (fila.code !== "ESCUELA_PERFIL_EXISTE" || !fila.data) {
        return {
            error: true,
            message: "No se encontró la escuela del usuario",
            code: "ESCUELA_NO_ENCONTRADA"
        };
    }

    let key: string;
    try {
        key = await subirImagenR2(
            validarImagen.buffer,
            validarImagen.nombre,
            validarImagen.tipo,
            CARPETA_LOGO_ESCUELA
        );
    } catch {
        return {
            error: true,
            message: "No se pudo subir la imagen a Cloudflare R2.",
            code: "ERROR_SUBIR_IMAGEN"
        };
    }

    const urlImagen = `${process.env.R2_PUBLIC_URL}/${key}`;

    let resultado: TipadoData<EscuelaLogoActualizado>;

    try {
        resultado = await dataEscuela.actualizarLogoEscuela({
            id_escuela,
            urlImagen,
            public_id: key
        });
    } catch (err) {
        // `iudEntidad` LANZA si el UPDATE no afecta filas: sin este catch la
        // imagen recien subida quedaria huerfana en R2 (R8).
        console.error("Error guardando el logo de la escuela:", err);

        await eliminarImagenR2(urlImagen).catch((errBorrado: Error) =>
            console.error("Error borrando el logo nuevo de R2 (compensación):", errBorrado)
        );

        return {
            error: true,
            message: "No se pudo guardar el logo de la escuela.",
            code: "ERROR_SERVIDOR"
        };
    }

    // La fila se leyó antes, así que un code distinto es falla interna, no 404.
    if (resultado.code !== "ESCUELA_LOGO_MODIFICAR") {
        await eliminarImagenR2(urlImagen).catch((err: Error) =>
            console.error("Error borrando el logo nuevo de R2 (compensación):", err)
        );

        return {
            error: true,
            message: "No se pudo guardar el logo de la escuela.",
            code: "ERROR_SERVIDOR"
        };
    }

    // El logo viejo se borra recién cuando el nuevo ya quedó guardado.
    if (fila.data.public_id) {
        await eliminarImagenR2(`${process.env.R2_PUBLIC_URL}/${fila.data.public_id}`).catch((err: Error) =>
            console.error("Error borrando el logo viejo de R2:", err)
        );
    }

    const dataHistorial: HistorialInputs = {
        id_escuela,
        id_usuario: usuario_id,
        modulo: "USUARIOS",
        accion: "MODIFICAR",
        id_registro: id_escuela,
        descripcion: `Se actualizó el logo de la escuela ${id_escuela}`,
        datos: { id_escuela, public_id: key }
    };

    await registroHistorial(dataHistorial).catch((err: Error) =>
        console.error("Error registrando historial actualizarLogoEscuela:", err)
    );

    return {
        error: false,
        message: "Logo actualizado correctamente",
        data: {
            id_escuela,
            razon_social: fila.data.razon_social ?? "Mi escuela",
            urlImagen,
        },
        code: "ESCUELA_LOGO_ACTUALIZADO"
    };
};

/**
 * Quita el logo de la escuela del usuario autenticado (spec 051).
 *
 * Orden: primero el `UPDATE` a `NULL`/`NULL` y después el borrado en R2
 * (mejor esfuerzo con `.catch`). Si la escuela ya estaba sin logo, responde
 * 200 sin escribir ni llamar a R2 y **sin** registrar historial (idempotente).
 *
 * El borrado en R2 se arma SIEMPRE con `public_id`: la `urlImagen` legacy de
 * la escuela 4 no es de R2 y pasarla haría fallar el borrado.
 *
 * @param data - `id_escuela` y `usuario_id` tomados del token.
 * @returns {Promise<TipadoData<EscuelaPerfilRetorno>>} `ESCUELA_LOGO_QUITADO`
 *   (200) o `ESCUELA_NO_ENCONTRADA` (404) / `ERROR_SERVIDOR` (500).
 */
const quitarLogoEscuela = async (
    data: { id_escuela: number; usuario_id: number }
): Promise<TipadoData<EscuelaPerfilRetorno>> => {
    const { id_escuela, usuario_id } = data;

    let fila: TipadoData<EscuelaLogoRow>;

    try {
        fila = await dataEscuela.obtenerLogoEscuela(id_escuela);
    } catch (err) {
        console.error("Error consultando la escuela del usuario:", err);

        return {
            error: true,
            message: "No se pudo consultar la escuela del usuario.",
            code: "ERROR_SERVIDOR"
        };
    }

    if (fila.code !== "ESCUELA_PERFIL_EXISTE" || !fila.data) {
        return {
            error: true,
            message: "No se encontró la escuela del usuario",
            code: "ESCUELA_NO_ENCONTRADA"
        };
    }

    // Idempotente: ya está sin logo, no se escribe ni se audita.
    if (fila.data.urlImagen === null && fila.data.public_id === null) {
        return {
            error: false,
            message: "Logo quitado correctamente",
            data: {
                id_escuela: fila.data.id_escuela,
                razon_social: fila.data.razon_social ?? "Mi escuela",
                urlImagen: null,
            },
            code: "ESCUELA_LOGO_QUITADO"
        };
    }

    let resultado: TipadoData<EscuelaLogoActualizado>;

    try {
        resultado = await dataEscuela.actualizarLogoEscuela({
            id_escuela,
            urlImagen: null,
            public_id: null
        });
    } catch (err) {
        // R9: si el UPDATE falla, R2 NO se toca.
        console.error("Error quitando el logo de la escuela:", err);

        return {
            error: true,
            message: "No se pudo quitar el logo de la escuela.",
            code: "ERROR_SERVIDOR"
        };
    }

    // La fila se leyó antes, así que un code distinto es falla interna, no 404.
    if (resultado.code !== "ESCUELA_LOGO_MODIFICAR") {
        return {
            error: true,
            message: "No se pudo quitar el logo de la escuela.",
            code: "ERROR_SERVIDOR"
        };
    }

    const publicIdAnterior = fila.data.public_id;

    if (publicIdAnterior) {
        await eliminarImagenR2(`${process.env.R2_PUBLIC_URL}/${publicIdAnterior}`).catch((err: Error) =>
            console.error("Error borrando el logo de R2:", err)
        );
    }

    const dataHistorial: HistorialInputs = {
        id_escuela,
        id_usuario: usuario_id,
        modulo: "USUARIOS",
        accion: "MODIFICAR",
        id_registro: id_escuela,
        descripcion: `Se quitó el logo de la escuela ${id_escuela}`,
        datos: { id_escuela, public_id: publicIdAnterior }
    };

    await registroHistorial(dataHistorial).catch((err: Error) =>
        console.error("Error registrando historial quitarLogoEscuela:", err)
    );

    return {
        error: false,
        message: "Logo quitado correctamente",
        data: {
            id_escuela,
            razon_social: fila.data.razon_social ?? "Mi escuela",
            urlImagen: null,
        },
        code: "ESCUELA_LOGO_QUITADO"
    };
};

export const method = {
    obtenerMiPerfil: tryCatchDatos(obtenerMiPerfil),
    modMiPerfil: tryCatchDatos(modMiPerfil),
    obtenerEscuelaPerfil: tryCatchDatos(obtenerEscuelaPerfil),
    actualizarLogoEscuela: tryCatchDatos(actualizarLogoEscuela),
    quitarLogoEscuela: tryCatchDatos(quitarLogoEscuela)
};