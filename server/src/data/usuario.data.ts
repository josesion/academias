import bcrypt from 'bcryptjs';

import { tryCatchDatos } from "../utils/tryCatchBD";
import { ClientError } from "../utils/error";
import { select } from "../utils/baseDatos";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
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

/**
 * Verifica si un correo ya está tomado para un usuario con ROL "usuario".
 *
 * Un usuario normal NO tiene fila en `alumnos`, así que solo se chequea la
 * tabla `usuarios`: el correo no puede repetir ni el `correo` ni el `usuario`
 * (login) de nadie. Delega al hook `buscarExistenteEntidad`.
 *
 * @param correo - Correo a validar.
 * @param excluirId - id_usuario que queda fuera de la búsqueda (opcional, para
 *                    que un usuario pueda conservar su propio correo al editar su perfil).
 * @returns {Promise<TipadoData<{ id_usuario: number; correo: string; usuario: string }>>}
 *   `CORREO_EXISTE` con la fila si ya está tomado / `CORREO_NO_EXISTE` si está libre.
 */
const buscarCorreoUsuario = async (
    correo: string,
    excluirId?: number
): Promise<TipadoData<{ id_usuario: number; correo: string; usuario: string }>> => {

    const sql = `SELECT id_usuario, correo, usuario
                 FROM usuarios
                 WHERE (correo = ? OR usuario = ?)
                   AND (? IS NULL OR id_usuario != ?);`;

    const idExcluir = excluirId ?? null;
    const valores: unknown[] = [correo, correo, idExcluir, idExcluir];

    return await buscarExistenteEntidad({
        slqEntidad: sql,
        valores: valores,
        entidad: "CORREO"
    });
};

/**
 * Verifica si un correo ya está tomado para un usuario con ROL "alumno".
 *
 * Para un alumno el correo es el LOGIN y debe quedar UNIFICADO en tres
 * columnas: `usuarios.correo`, `usuarios.usuario` y `alumnos.email` (así lo
 * necesita el JOIN de `metricas.alumnos.data.obtenerDniAlumno`, que une
 * `usuarios.correo = alumnos.email`). Por eso el chequeo cruza las dos tablas
 * con UNION. Delega al hook `buscarExistenteEntidad`.
 *
 * @param correo - Correo a validar.
 * @param excluirId - id_usuario que queda fuera de la búsqueda en `usuarios` (opcional).
 * @param excluirDni - dni_alumno que queda fuera de la búsqueda en `alumnos` (opcional).
 * @returns {Promise<TipadoData<{ origen: string; id: number; valor: string }>>}
 *   `CORREO_EXISTE` con la fila del primer choque / `CORREO_NO_EXISTE` si está libre.
 */
const buscarCorreoAlumno = async (
    correo: string,
    excluirId?: number,
    excluirDni?: number
): Promise<TipadoData<{ origen: string; id: number; valor: string }>> => {

    const sql = `SELECT 'usuarios' AS origen, id_usuario AS id, correo AS valor
                 FROM usuarios
                 WHERE (correo = ? OR usuario = ?)
                   AND (? IS NULL OR id_usuario != ?)
                 UNION ALL
                 SELECT 'alumnos' AS origen, dni_alumno AS id, email AS valor
                 FROM alumnos
                 WHERE email = ?
                   AND (? IS NULL OR dni_alumno != ?);`;

    const idExcluir = excluirId ?? null;
    const dniExcluir = excluirDni ?? null;
    const valores: unknown[] = [
        correo, correo, idExcluir, idExcluir,
        correo, dniExcluir, dniExcluir
    ];

    return await buscarExistenteEntidad({
        slqEntidad: sql,
        valores: valores,
        entidad: "CORREO"
    });
};

/**
 * Verifica que un nombre de usuario (`usuarios.usuario`) no esté repetido.
 *
 * Se usa al cambiar el login (`nuevo_usuario`) en el perfil: el usuario no
 * puede ser igual al de otra cuenta. Delega al hook `buscarExistenteEntidad`.
 *
 * @param usuario - Nombre de usuario a validar.
 * @param excluirId - id_usuario que queda fuera de la búsqueda (opcional, para
 *                    que un usuario pueda conservar su propio nombre de usuario).
 * @returns {Promise<TipadoData<{ id_usuario: number; usuario: string }>>}
 *   `USUARIO_EXISTE` con la fila si ya está en uso / `USUARIO_NO_EXISTE` si está libre.
 */
const buscarUsuarioDisponible = async (
    usuario: string,
    excluirId?: number
): Promise<TipadoData<{ id_usuario: number; usuario: string }>> => {

    const sql = `SELECT id_usuario, usuario
                 FROM usuarios
                 WHERE usuario = ?
                   AND (? IS NULL OR id_usuario != ?);`;

    const idExcluir = excluirId ?? null;
    const valores: unknown[] = [usuario, idExcluir, idExcluir];

    return await buscarExistenteEntidad({
        slqEntidad: sql,
        valores: valores,
        entidad: "USUARIO"
    });
};

/**
 * Obtiene el `dni_alumno` de la cuenta del usuario logueado con ROL "alumno".
 *
 * El token NO trae el `dni`, así que se resuelve aquí cruzando `usuarios` con
 * `alumnos` por el correo (`usuarios.correo = alumnos.email`, el mismo vínculo
 * que usa `metricas.alumnos.data.obtenerDniAlumno`). Sirve para excluir al
 * propio alumno al validar que su nuevo correo no esté tomado.
 *
 * Si el correo y el email del alumno están desincronizados, no hay fila y la
 * validación degrada a chequeo sin exclusión (no rompe el flujo).
 *
 * @param usuario_id - id_usuario del usuario logueado (viene del token).
 * @returns {Promise<TipadoData<{ dni_alumno: number }>>}
 *   `DNI_ALUMNO_EXISTE` con el dni / `DNI_ALUMNO_NO_EXISTE` si no se pudo resolver.
 */
const buscarDniAlumno = async (
    usuario_id: number
): Promise<TipadoData<{ dni_alumno: number }>> => {

    const sql = `SELECT a.dni_alumno
                 FROM alumnos a
                 JOIN usuarios u ON u.correo = a.email
                 WHERE u.id_usuario = ?;`;

    return await buscarExistenteEntidad<{ dni_alumno: number }>({
        slqEntidad: sql,
        valores: [usuario_id],
        entidad: "DNI_ALUMNO"
    });
};

/**
 * Verifica que la contraseña actual enviada por el usuario sea la correcta.
 *
 * Se usa en el perfil al cambiar la contraseña: antes de aceptar la nueva se
 * compara la `contrasena_actual` con el hash guardado en `usuarios.contrasena`.
 *
 * @param usuario_id - id_usuario del usuario logueado (viene del token).
 * @param contrasena - Contraseña actual en texto plano a verificar.
 * @returns {Promise<TipadoData<null>>}
 *   `CONTRASENA_VALIDA` si coincide /
 *   `CONTRASENA_INVALIDA` si no coincide /
 *   `USER_NOT_FOUND` si el usuario no existe.
 */
const verificarContrasenaActual = async (
    usuario_id: number,
    contrasena: string
): Promise<TipadoData<null>> => {

    const sql = `SELECT contrasena FROM usuarios WHERE id_usuario = ?;`;
    const resultado = await select<{ contrasena: string }>(sql, [usuario_id]);

    if (resultado.length <= 0) {
        return {
            error: true,
            message: "Usuario no encontrado",
            data: null,
            code: "USER_NOT_FOUND"
        };
    }

    const coincide = await bcrypt.compare(contrasena, resultado[0].contrasena);

    if (!coincide) {
        return {
            error: true,
            message: "La contraseña actual es incorrecta",
            data: null,
            code: "CONTRASENA_INVALIDA"
        };
    }

    return {
        error: false,
        message: "Contraseña actual verificada correctamente",
        data: null,
        code: "CONTRASENA_VALIDA"
    };
};

const buscarIdUsuario = async (id: number): Promise<TipadoData<DataIdUsuario>> => {
    
    // 1. Cambiamos la consulta SQL para que busque por ID (esto es vital)
    const sql = `SELECT 
                    u.usuario,
                    u.rol,
                    e.razon_social,
                    e.rubro,
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
            rubro : resultado[0].rubro,
            tipo : resultado[0].tipo,
            estado_suscripcion : resultado[0].estado_suscripcion
        }, 
        code: "USER_FOUND",
    };
};



/**
 * Escribe los cambios de perfil del usuario autenticado (usuario, contraseña,
 * correo y/o celular).
 *
 * Esta función SOLO ESCRIBE: las validaciones (contraseña actual correcta,
 * unicidad de usuario y de correo, formato de email, unificación de los campos
 * del alumno) las hace el Servicio ANTES de llamar acá. Por eso acá ya no se
 * verifica la contraseña ni se chequea si un usuario está repetido.
 *
 * - Usa un único `UPDATE` con `SET` dinámico: solo se escriben los campos que
 *   realmente cambiaron (si no cambió ninguno, no se ejecuta ninguna query).
 * - Para ROL ALUMNO el login es el correo, así que deben quedar sincronizadas
 *   3 columnas: `usuarios.usuario`, `usuarios.correo` y `alumnos.email`. Como
 *   son 2 tablas, va dentro de una transacción (`iudEntidadTransaction`).
 *   El `dni_alumno` lo resuelve el Servicio y llega por props.
 *
 * @param parametro - Datos a escribir + `usuario_id` (del token) y, para alumno,
 *                    `dni_alumno` (resuelto por el Servicio).
 * @returns {Promise<TipadoData<DataMiPerfil>>} `PROFILE_UPDATED` con el perfil final.
 * @throws {ClientError} `USER_NOT_FOUND` (404) si el usuario ya no existe.
 */
const modMiPerfil = async (parametro: ModMiPerfilInput): Promise<TipadoData<DataMiPerfil>> => {
    // OJO: contrasena_actual NO se destructura — ya la validó el Servicio (noUnusedLocals)
    const { usuario_id, nuevo_usuario, nueva_contrasena, correo, celular, dni_alumno } = parametro;

    // 1. Leer estado actual (SIN la contraseña: ya no se verifica acá)
    //    Nota: `celular` se tipea `string` para respetar el contrato DataMiPerfil
    //    (la BD puede devolver null y el valor viaja tal cual, igual que antes).
    const sqlSelect = `SELECT usuario, nombre, apellido, correo, celular, rol, id_escuela
                       FROM usuarios WHERE id_usuario = ?;`;
    const resultado = await select<{
        usuario: string; nombre: string; apellido: string; correo: string;
        celular: string; rol: string; id_escuela: number;
    }>(sqlSelect, [usuario_id]);

    if (resultado.length <= 0) {
        throw new ClientError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }
    const { usuario: usuarioBD, nombre, apellido, correo: correoBD,
            celular: celularBD, rol, id_escuela } = resultado[0];

    // 2. Valores finales y SET dinámico: SOLO se escribe lo que cambió
    const usuarioFinal = nuevo_usuario ?? usuarioBD;
    const correoFinal  = correo ?? correoBD;
    const celularFinal = celular ?? celularBD;

    const campos: string[]   = [];
    const valores: unknown[] = [];

    if (nuevo_usuario !== undefined && nuevo_usuario !== usuarioBD) {
        campos.push("usuario = ?"); valores.push(nuevo_usuario);
    }
    if (correo !== undefined && correo !== correoBD) {
        campos.push("correo = ?"); valores.push(correo);
    }
    if (celular !== undefined && celular !== celularBD) {
        campos.push("celular = ?"); valores.push(celular);
    }

    if (nueva_contrasena) {
        campos.push("contrasena = ?");
        valores.push(await bcrypt.hash(nueva_contrasena, 10));
    }

    const datosFinales = { usuario: usuarioFinal, nombre, apellido,
                           correo: correoFinal, celular: celularFinal, rol, id_escuela };

    // Nada cambió → no se ejecuta ningún UPDATE
    if (campos.length === 0) {
        return { error: false, message: "Perfil actualizado correctamente",
                 data: datosFinales, code: "PROFILE_UPDATED" };
    }

    // 3. Alumno: el login ES el correo → toca las 2 tablas, así que va en transacción.
    //    El dni YA VIENE resuelto del Servicio (dni_alumno), no se consulta de nuevo.
    const esAlumno    = rol === "alumno";
    const cambioLogin = usuarioFinal !== usuarioBD || correoFinal !== correoBD;
    const sincronizarAlumno = esAlumno && cambioLogin && dni_alumno !== undefined;

    const transaccion = await iudEntidadTransaction<DataMiPerfil>(async (conn) => {
        // Un solo UPDATE de usuarios con el SET armado dinámicamente
        await conn.execute(
            `UPDATE usuarios SET ${campos.join(", ")} WHERE id_usuario = ?;`,
            [...valores, usuario_id]
        );

        // Alumno: sincronizar alumnos.email con el nuevo correo (usa el dni del Servicio)
        if (sincronizarAlumno) {
            await conn.execute(
                `UPDATE alumnos SET email = ? WHERE dni_alumno = ?;`,
                [correoFinal, dni_alumno]
            );
        }

        return datosFinales;
    });

    if (transaccion.error) {
        throw new ClientError("No se pudo actualizar el perfil", 500, "ERROR_SERVIDOR");
    }

    return { error: false, message: "Perfil actualizado correctamente",
             data: transaccion.data, code: "PROFILE_UPDATED" };
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
    buscarCorreoUsuario     : tryCatchDatos(buscarCorreoUsuario),
    buscarCorreoAlumno      : tryCatchDatos(buscarCorreoAlumno),
    buscarUsuarioDisponible : tryCatchDatos(buscarUsuarioDisponible),
    buscarDniAlumno         : tryCatchDatos(buscarDniAlumno),
    verificarContrasenaActual: tryCatchDatos(verificarContrasenaActual),
    buscarIdUsuario         : tryCatchDatos(buscarIdUsuario),
    modMiPerfil             : tryCatchDatos(modMiPerfil),
    obtenerMiPerfil         : tryCatchDatos(obtenerMiPerfil)
}